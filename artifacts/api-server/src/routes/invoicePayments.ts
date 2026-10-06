import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { recomputeInvoiceBalances } from "../lib/invoiceBalances";

const router = Router();

const PAYMENT_TYPES   = ["Cash", "Bank Transfer", "UPI", "Cheque", "Online Gateway", "Adjustment", "Other"] as const;
const PAYMENT_STATUSES = ["Processing", "Completed", "Failed"] as const;

// ── GET /api/invoice-payments/accounts ──────────────────────────────────────
// Returns all client + vendor invoices enriched with payment summary
router.get("/invoice-payments/accounts", requireAuth, async (req, res) => {
  try {
    const { direction, status, search, page = "1", limit = "30" } = req.query as Record<string, string>;
    const off = (parseInt(page) - 1) * parseInt(limit);

    /* Show all invoices by default; let the status dropdown drive visibility
       (previously Draft/Cancelled were hard-excluded which hid most rows). */
    let where = "WHERE i.is_deleted = false";
    const params: (string | number)[] = [];
    let idx = 1;

    if (direction && direction !== "all") { where += ` AND i.invoice_direction = $${idx++}`; params.push(direction); }
    if (status && status !== "all")       { where += ` AND i.invoice_status = $${idx++}`;    params.push(status); }
    if (search)                           {
      where += ` AND (i.invoice_no ILIKE $${idx} OR c.brand_name ILIKE $${idx} OR v.brand_name ILIKE $${idx++})`;
      params.push(`%${search}%`);
    }

    const countQ = await pool.query(`
      SELECT COUNT(*) AS total
      FROM invoices i
      LEFT JOIN clients c ON c.id = i.client_id AND c.is_deleted = false
      LEFT JOIN vendors v ON v.id = i.vendor_id AND v.is_deleted = false
      ${where}
    `, params);

    const rows = await pool.query(`
      SELECT
        i.id, i.invoice_no, i.invoice_direction, i.invoice_type, i.invoice_status,
        i.client_id, i.vendor_id,
        COALESCE(c.brand_name, i.client_name, '') AS party_name,
        COALESCE(v.brand_name, '')                 AS vendor_name,
        i.currency_code, i.exchange_rate_snapshot,
        i.total_amount::numeric,
        i.received_amount::numeric,
        i.pending_amount::numeric,
        i.invoice_date, i.due_date,
        (SELECT COUNT(*) FROM invoice_payments ip WHERE ip.invoice_id = i.id AND ip.is_deleted = false AND ip.payment_status <> 'Failed') AS payment_count,
        (SELECT MAX(ip.payment_date) FROM invoice_payments ip WHERE ip.invoice_id = i.id AND ip.is_deleted = false) AS last_payment_date
      FROM invoices i
      LEFT JOIN clients c ON c.id = i.client_id AND c.is_deleted = false
      LEFT JOIN vendors v ON v.id = i.vendor_id AND v.is_deleted = false
      ${where}
      ORDER BY i.invoice_date DESC, i.id DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `, [...params, parseInt(limit), off]);

    return res.json({ data: rows.rows, total: parseInt(countQ.rows[0].total), page: parseInt(page), limit: parseInt(limit) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /api/invoice-payments?invoice_id=X ──────────────────────────────────
router.get("/invoice-payments", requireAuth, async (req, res) => {
  try {
    const invoiceId = parseInt(String(req.query.invoice_id ?? ""), 10);

    const { rows } = await pool.query(
      `
      SELECT
        ip.payment_id,
        ip.invoice_id,
        ip.payment_direction,
        ip.party_id,
        ip.payment_type,
        ROUND(ip.payment_amount::numeric, 2)           AS payment_amount,
        ip.currency_code,
        ip.exchange_rate_snapshot,
        ROUND(ip.base_currency_amount::numeric, 2)     AS base_currency_amount,
        ip.transaction_reference,
        ip.payment_status,
        ip.payment_date,
        ip.remarks,
        ROUND(COALESCE(t.tds_amount, 0)::numeric, 2)   AS tds_amount,
        ROUND(COALESCE(t.tds_rate, 0)::numeric, 2)     AS tds_rate,
        tm.section_code                                AS tds_section_code
      FROM invoice_payments ip
      LEFT JOIN LATERAL (
        SELECT
          SUM(ipt.tds_amount) AS tds_amount,
          MAX(ipt.tds_rate)   AS tds_rate,
          MAX(ipt.tds_master_id) AS tds_master_id
        FROM invoice_payment_tds ipt
        WHERE ipt.payment_id = ip.payment_id
          AND ipt.status = 'DEDUCTED'
      ) t ON true
      LEFT JOIN tds_master tm ON tm.id = t.tds_master_id
      WHERE ip.is_deleted = false
        ${Number.isFinite(invoiceId) ? "AND ip.invoice_id = $1" : ""}
      ORDER BY ip.payment_date DESC, ip.payment_id DESC
      `,
      Number.isFinite(invoiceId) ? [invoiceId] : []
    );

    return res.json({ data: rows });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/invoice-payments ───────────────────────────────────────────────
const round2 = (n: number): number => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
interface InvoiceLineBalance {
  id: number;
  lineNo: number;
  taxable: number;   // invoice_line_items.total (qty × unit_price, ex-GST)
  gst: number;       // taxable × gstPct / 100
  gstPct: number;
  gross: number;     // taxable + gst
  remaining: number; // gross − already-allocated gross
}

interface InvoiceAllocation {
  lineId: number;
  allocGross: number;
  allocTaxable: number;
  allocGst: number;
  gstPct: number;
  tdsAmount: number;
  netReceived: number;
}

async function getInvoiceLineBalances(
  client: any,
  invoiceId: number
): Promise<InvoiceLineBalance[]> {
  const { rows } = await client.query(
    `SELECT
       ili.id,
       ili.line_no,
       ROUND(ili.total::numeric, 2) AS total,
       ili.hsn_gst_pct,
       ili.created_at,
       COALESCE(SUM(ROUND(ipi.allocated_gross_amount::numeric, 2)), 0) AS allocated
     FROM invoice_line_items ili
     LEFT JOIN invoice_payment_items ipi
       ON ipi.invoice_line_item_id = ili.id
     WHERE ili.invoice_id = $1
       AND ili.is_deleted = false
     GROUP BY ili.id, ili.line_no, ili.total, ili.hsn_gst_pct, ili.created_at
     ORDER BY ili.created_at ASC, ili.id ASC`,
    [invoiceId]
  );

  return rows.map((r: any) => {
    const taxable   = round2(r.total ?? 0);
    const gstPct    = parseFloat(String(r.hsn_gst_pct ?? "0")) || 0;
    const gst       = gstPct > 0 ? round2((taxable * gstPct) / 100) : 0;
    const gross     = round2(taxable + gst);
    const allocated = round2(r.allocated ?? 0);
    const remaining = Math.max(0, round2(gross - allocated));

    return {
      id: r.id,
      lineNo: r.line_no,
      taxable,
      gst,
      gstPct,
      gross,
      remaining,
    };
  });
}

function allocateInvoiceWaterfall(
  amountToAllocate: number,
  lines: InvoiceLineBalance[],
  tdsRate: number,
  tdsThreshold: number
): { allocations: InvoiceAllocation[]; unallocated: number } {
  let remainingAmount = round2(amountToAllocate);
  const allocations: InvoiceAllocation[] = [];

  for (const line of lines) {
    if (remainingAmount <= 0.005) break;
    if (line.remaining <= 0.005) continue;

    const allocGross = round2(Math.min(remainingAmount, line.remaining));

    // Split gross → taxable + GST from line GST %, force 2 dp
    let allocTaxable: number;
    let allocGst: number;

    if (line.gross > 0 && line.gstPct > 0) {
      allocTaxable = round2(allocGross / (1 + line.gstPct / 100));
      allocGst = round2(allocGross - allocTaxable);
    } else {
      allocTaxable = allocGross;
      allocGst = 0;
    }

    const tdsApplicable = allocTaxable >= tdsThreshold;
    const tdsAmount = tdsApplicable
      ? round2((allocTaxable * tdsRate) / 100)
      : 0;
    const netReceived = round2(allocGross - tdsAmount);

    allocations.push({
      lineId: line.id,
      allocGross,
      allocTaxable,
      allocGst,
      gstPct: line.gstPct,
      tdsAmount,
      netReceived,
    });

    remainingAmount = round2(remainingAmount - allocGross);
  }

  return { allocations, unallocated: remainingAmount };
}

async function insertInvoicePaymentItems(
  client: any,
  paymentId: number,
  invoiceId: number,
  allocations: InvoiceAllocation[],
  username: string
): Promise<Map<number, number>> {
  const lineToPaymentItem = new Map<number, number>();
  let seq = 1;

  for (const a of allocations) {
    const res = await client.query(
      `INSERT INTO invoice_payment_items
         (payment_id, invoice_id, invoice_line_item_id,
          allocated_gross_amount, allocated_taxable_amount,
          net_received_amount, allocation_sequence, remarks, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        paymentId,
        invoiceId,
        a.lineId,
        round2(a.allocGross).toFixed(2),
        round2(a.allocTaxable).toFixed(2),
        round2(a.netReceived).toFixed(2),
        seq++,
        "",
        username,
      ]
    );
    lineToPaymentItem.set(a.lineId, res.rows[0].id);
  }

  return lineToPaymentItem;
}

async function insertInvoicePaymentTds(
  client: any,
  tdsMasterId: number,
  paymentId: number,
  paymentDate: string | Date,
  partyId: number,
  invoiceId: number,
  grossAmount: number,
  gstAmount: number,
  gstPercentage: number,
  baseAmount: number,
  paidAmount: number,
  tdsRate: number,
  tdsAmount: number,
  paymentCurrencyCode: string,
  paymentExchangeRate: number,
  eligibleAllocations: Array<InvoiceAllocation & { paymentItemId: number }>,
  username: string
): Promise<number> {
  const tdsRes = await client.query(
    `INSERT INTO invoice_payment_tds
       (tds_master_id, payment_id, payment_date, client_id, invoice_id,
        gross_amount, gst_amount, gst_percentage,
        payment_currency_code, payment_exchange_rate,
        base_amount, paid_amount, tds_rate, tds_amount, status, created_by)
     VALUES ($1,$2,$3,$4,$5,
             $6,$7,$8,
             $9,$10,
             $11,$12,$13,$14,'DEDUCTED',$15)
     RETURNING id`,
    [
      tdsMasterId,
      paymentId,
      paymentDate ? new Date(paymentDate) : new Date(),
      partyId,
      invoiceId,
      round2(grossAmount).toFixed(2),
      round2(gstAmount).toFixed(2),
      round2(gstPercentage).toFixed(2),
      paymentCurrencyCode,
      Number(paymentExchangeRate).toFixed(6),
      round2(baseAmount).toFixed(2),
      round2(paidAmount).toFixed(2),
      round2(tdsRate).toFixed(2),
      round2(tdsAmount).toFixed(2),
      username,
    ]
  );
  const tdsId = tdsRes.rows[0].id;

  for (const a of eligibleAllocations) {
    await client.query(
      `INSERT INTO invoice_payment_tds_items
         (invoice_payment_tds_id, invoice_line_item_id, payment_item_id,
          base_amount, gst_amount, gst_percentage,
          tds_rate, tds_amount, paid_amount, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        tdsId,
        a.lineId,
        a.paymentItemId,
        round2(a.allocTaxable).toFixed(2),
        round2(a.allocGst).toFixed(2),
        round2(a.gstPct).toFixed(2),
        round2(tdsRate).toFixed(2),
        round2(a.tdsAmount).toFixed(2),
        round2(a.netReceived).toFixed(2),
        username,
      ]
    );
  }

  return tdsId;
}

// ============================================================================
// POST /invoice-payments
// ============================================================================

router.post( "/invoice-payments", requireAuth,
  async (req: any, res) => {
    const {
      invoice_id,
      payment_type,
      payment_amount,
      currency_code = "INR",
      exchange_rate_snapshot = 1,
      transaction_reference = "",
      payment_status = "Completed",
      payment_date,
      remarks = "",
      tds_master_id,
    } = req.body;

    if (!invoice_id || !payment_amount || !payment_date) {
      return res.status(400).json({
        error: "invoice_id, payment_amount, payment_date are required",
      });
    }
    if (!PAYMENT_TYPES.includes(payment_type)) {
      return res.status(400).json({ error: "Invalid payment_type" });
    }
    if (!PAYMENT_STATUSES.includes(payment_status)) {
      return res.status(400).json({ error: "Invalid payment_status" });
    }

    const client = await pool.connect();
    let began = false;

    try {
      await client.query("BEGIN");
      began = true;

      // 1. Lock the invoice
      const invRes = await client.query(
        "SELECT * FROM invoices WHERE id = $1 AND is_deleted = false FOR UPDATE",
        [invoice_id]
      );
      if (!invRes.rows.length) {
        await client.query("ROLLBACK");
        began = false;
        return res.status(404).json({ error: "Invoice not found" });
      }
      const inv = invRes.rows[0];

      const payAmt = round2(parseFloat(String(payment_amount)));
      const exRate = parseFloat(String(exchange_rate_snapshot)) || 1;
      const baseAmt = round2(payAmt * exRate); // INR anchor

      if (!Number.isFinite(payAmt) || payAmt <= 0) {
        await client.query("ROLLBACK");
        began = false;
        return res.status(400).json({ error: "payment_amount must be greater than 0" });
      }

      const direction =
        inv.invoice_direction === "Vendor" ? "Paid" : "Received";
      const partyId =
        inv.invoice_direction === "Vendor" ? inv.vendor_id : inv.client_id;
      const createdBy = req.user?.email ?? "";

      const invRate = parseFloat(String(inv.exchange_rate_snapshot ?? "1")) || 1;
      const pendingNow = round2(inv.pending_amount ?? 0);

      // 2. Overpayment guard — compared in the invoice's own currency
      if (payment_status === "Completed") {
        const amtInInvoiceCcy = round2(baseAmt / invRate);
        console.log("[invoice-payments] compare amounts", {
          invoice_id,
          payment_amount_raw: payment_amount,
          payAmt,
          exRate,
          baseAmt,
          invRate,
          pendingNow,
          amtInInvoiceCcy,
          pendingGuard: {
            allowed: pendingNow + 0.01,
            exceeds: amtInInvoiceCcy > pendingNow + 0.01,
          },
        });

        if (amtInInvoiceCcy > pendingNow + 0.01) {
          await client.query("ROLLBACK");
          began = false;
          return res.status(400).json({
            error: `Payment amount (${amtInInvoiceCcy.toFixed(2)} in invoice currency) exceeds pending balance (${pendingNow.toFixed(2)})`,
          });
        }
      }

      // 3. Resolve TDS master (if provided)
      let tdsMaster: {
        id: number;
        rate_percent: number;
        threshold_amount: number;
      } | null = null;

      if (tds_master_id) {
        const tdsRes = await client.query(
          `SELECT id,
                  rate_percent::numeric AS rate_percent,
                  threshold_amount::numeric AS threshold_amount
             FROM tds_master
            WHERE id = $1
              AND status = true
              AND is_deleted = false`,
          [tds_master_id]
        );
        if (!tdsRes.rows.length) {
          await client.query("ROLLBACK");
          began = false;
          return res.status(400).json({
            error: `Invalid or inactive TDS master (ID: ${tds_master_id})`,
          });
        }
        tdsMaster = {
          id: tdsRes.rows[0].id,
          rate_percent: parseFloat(tdsRes.rows[0].rate_percent),
          threshold_amount: parseFloat(
            tdsRes.rows[0].threshold_amount || "0"
          ),
        };
      }

      // 4. Amount to allocate, in invoice currency
      const allocAmtInInvoiceCcy = round2(baseAmt / invRate);

      // 5. Load line balances and run waterfall
      const lineBalances = await getInvoiceLineBalances(client, invoice_id);
      console.log("[invoice-payments] line balances", {
        lineCount: lineBalances.length,
        lines: lineBalances.map((l) => ({
          id: l.id,
          lineNo: l.lineNo,
          taxable: l.taxable,
          gst: l.gst,
          gstPct: l.gstPct,
          gross: l.gross,
          remaining: l.remaining,
        })),
        sumRemaining: round2(
          lineBalances.reduce((s, l) => s + l.remaining, 0)
        ),
        allocAmtInInvoiceCcy,
      });

      if (lineBalances.length === 0) {
        await client.query("ROLLBACK");
        began = false;
        return res.status(400).json({
          error: "Invoice has no line items — cannot allocate payment.",
        });
      }

      const tdsRate = tdsMaster?.rate_percent ?? 0;
      const tdsThreshold = tdsMaster?.threshold_amount ?? 0;

      const { allocations, unallocated } = allocateInvoiceWaterfall(
        allocAmtInInvoiceCcy,
        lineBalances,
        tdsRate,
        tdsThreshold
      );

      if (unallocated > 0.01) {
        await client.query("ROLLBACK");
        began = false;
        return res.status(400).json({
          error: `Amount exceeds total outstanding balance on this invoice by ${unallocated.toFixed(2)}.`,
        });
      }
      if (allocations.length === 0) {
        await client.query("ROLLBACK");
        began = false;
        return res.status(400).json({
          error: "Nothing to allocate — invoice is already fully paid.",
        });
      }

      // 6. Insert the aggregate payment row
      const pmtRes = await client.query(
        `
        INSERT INTO invoice_payments
          (invoice_id, payment_direction, party_id, payment_type, payment_amount,
           currency_code, exchange_rate_snapshot, base_currency_amount,
           transaction_reference, payment_status, payment_date, remarks, created_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING *
      `,
        [
          invoice_id,
          direction,
          partyId,
          payment_type,
          payAmt.toFixed(2),
          currency_code,
          exRate,
          baseAmt.toFixed(2),
          transaction_reference,
          payment_status,
          payment_date,
          remarks,
          createdBy,
        ]
      );

      const paymentId = pmtRes.rows[0].payment_id;

      // 7. Insert invoice_payment_items (line-level allocation)
      const lineToPaymentItem = await insertInvoicePaymentItems(
        client,
        paymentId,
        invoice_id,
        allocations,
        createdBy
      );

      // 8. Insert TDS aggregate + per-line rows
      if (tdsMaster) {
        const eligible = allocations.filter((a) => a.tdsAmount > 0);

        if (eligible.length > 0) {
          const totalGross = round2(
            allocations.reduce((s, a) => s + a.allocGross, 0)
          );
          const totalTaxable = round2(
            allocations.reduce((s, a) => s + a.allocTaxable, 0)
          );
          const totalGst = round2(
            allocations.reduce((s, a) => s + a.allocGst, 0)
          );
          const totalTds = round2(
            eligible.reduce((s, a) => s + a.tdsAmount, 0)
          );

          // TDS tables store INR (base). Convert invoice ccy → INR via invRate.
          const grossINR = round2(totalGross * invRate);
          const taxableINR = round2(totalTaxable * invRate);
          const gstINR = round2(totalGst * invRate);
          const tdsINR = round2(totalTds * invRate);
          const paidINR = round2((totalGross - totalTds) * invRate);
          const blendedGstPct = totalTaxable > 0 ? round2((totalGst / totalTaxable) * 100) : 0;
          const eligibleWithItems = eligible.map((a) => ({
            ...a,
            paymentItemId: lineToPaymentItem.get(a.lineId)!,
          }));

          await insertInvoicePaymentTds(
           client, tdsMaster.id, paymentId, payment_date, partyId, invoice_id, grossINR, gstINR, blendedGstPct,
            taxableINR,
            paidINR,
            tdsRate,
            tdsINR,
            currency_code,
            exRate,
            eligibleWithItems,
            createdBy
          );
        }
      }

      // 9. Recompute invoice balances
      const bal = await recomputeInvoiceBalances(client, invoice_id);
      const totalReceived = round2(bal?.receivedAmount ?? 0);
      const pendingAmt = round2(bal?.pendingAmount ?? 0);
      const newStatus = bal?.status ?? (inv.invoice_status ?? "Generated");

      // 10. Ledger entries
      if (direction === "Received" && inv.client_id) {
        await client.query(
          `
          INSERT INTO client_invoice_ledger
            (client_id, invoice_id, entry_type, payment_amount, payment_date,
             transaction_reference, status, created_by)
          VALUES ($1,$2,'Payment Received',$3,$4,$5,$6,$7)
        `,
          [
            inv.client_id,
            invoice_id,
            payAmt.toFixed(2),
            payment_date,
            transaction_reference,
            payment_status,
            createdBy,
          ]
        );
      } else if (direction === "Paid" && inv.vendor_id) {
        await client.query(
          `
          INSERT INTO vendor_payments
            (vendor_id, vendor_name, payment_date, amount,
             currency_code, exchange_rate_snapshot, base_currency_amount,
             payment_mode, reference_no, notes, order_type, created_by)
          SELECT $1, v.brand_name, $2::timestamptz, $3,
                 $4, $5, $6, $7, $8, $9, 'invoice', $10
          FROM vendors v WHERE v.id = $1
        `,
          [
            inv.vendor_id,
            payment_date + "T00:00:00Z",
            payAmt.toFixed(2),
            currency_code,
            String(exRate),
            baseAmt.toFixed(2),
            payment_type,
            transaction_reference,
            remarks,
            createdBy,
          ]
        );
      }

      await client.query("COMMIT");
      began = false;

      return res.json({
        data: pmtRes.rows[0],
        invoice_status: newStatus,
        received_amount: totalReceived,
        pending_amount: pendingAmt,
        allocations: allocations.map((a) => ({
          line_id: a.lineId,
          gross: round2(a.allocGross).toFixed(2),
          taxable: round2(a.allocTaxable).toFixed(2),
          gst: round2(a.allocGst).toFixed(2),
          tds: round2(a.tdsAmount).toFixed(2),
          net: round2(a.netReceived).toFixed(2),
        })),
      });
    } catch (err: any) {
      if (began) {
        try {
          await client.query("ROLLBACK");
        } catch {}
      }
      console.error("Error in /invoice-payments:", err);
      return res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  }
);

// ── DELETE /api/invoice-payments/:id ────────────────────────────────────────
router.delete( "/invoice-payments/:id", requireAuth,
  async (req, res) => {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const client = await pool.connect();
    let began = false;
    try {
      await client.query("BEGIN");
      began = true;

      const deletedBy = req.user?.email ?? "system";
      const now = new Date();

      // 1. Lock the payment row
      const pmtRes = await client.query(
        `SELECT * FROM invoice_payments
          WHERE payment_id = $1 AND is_deleted = false
          FOR UPDATE`,
        [id]
      );
      if (!pmtRes.rows.length) {
        await client.query("ROLLBACK"); began = false;
        return res.status(404).json({ error: "Payment not found" });
      }
      const pmt = pmtRes.rows[0];

      // 2. Soft-delete child TDS items (deepest level)
      const tdsRes = await client.query(
        `SELECT id FROM invoice_payment_tds
          WHERE payment_id = $1 AND is_deleted = false`,
        [id]
      );
      const tdsIds = tdsRes.rows.map((r: any) => r.id);

      if (tdsIds.length > 0) {
        await client.query(
          `UPDATE invoice_payment_tds_items
              SET is_deleted = true, deleted_by = $2, deleted_at = $3, updated_by = $2, updated_at = $3
            WHERE invoice_payment_tds_id = ANY($1::int[])
              AND is_deleted = false`,
          [tdsIds, deletedBy, now]
        );
      }

      // 3. Soft-delete the TDS aggregate rows
      await client.query(
        `UPDATE invoice_payment_tds
            SET is_deleted = true, deleted_by = $2, deleted_at = $3, updated_by = $2, updated_at = $3
          WHERE payment_id = $1
            AND is_deleted = false`,
        [id, deletedBy, now]
      );

      // 4. Soft-delete the payment item allocations
      await client.query(
        `UPDATE invoice_payment_items
            SET is_deleted = true, deleted_by = $2, deleted_at = $3, updated_by = $2, updated_at = $3
          WHERE payment_id = $1
            AND is_deleted = false`,
        [id, deletedBy, now]
      );

      // 5. Soft-delete the payment row itself
      await client.query(
        `UPDATE invoice_payments
           SET is_deleted = true, updated_at = NOW(), updated_by = $2, deleted_by = $2, deleted_at = $3
          WHERE payment_id = $1
            AND is_deleted = false`,
        [id, deletedBy, now]
      );

      // 6. Recompute invoice totals from the remaining payments
      const bal = await recomputeInvoiceBalances(client, pmt.invoice_id);

      await client.query("COMMIT");
      began = false;
      return res.json({
        success: true,
        invoice_status: bal?.status,
        received_amount: bal?.receivedAmount ?? 0,
        pending_amount: bal?.pendingAmount ?? 0,
      });
    } catch (err: any) {
      if (began) { try { await client.query("ROLLBACK"); } catch {} }
      console.error("Error deleting invoice payment:", err);
      return res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  }
);

export default router;
