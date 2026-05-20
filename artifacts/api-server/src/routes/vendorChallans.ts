import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import type { AuthRequest } from "../middlewares/requireAuth";
import { uploadMiddleware, uploadFile, deleteUpload } from "../utils/uploadHelper";

const router = Router();

function financialYear(): string {
  const now = new Date();
  const yr = now.getFullYear();
  const mo = now.getMonth() + 1;
  const startYr = mo >= 4 ? yr : yr - 1;
  return `${startYr}-${String(startYr + 1).slice(2)}`;
}

async function nextChallanNumber(): Promise<string> {
  const fy = financialYear();
  const r = await pool.query(
    `SELECT COUNT(*) FROM vendor_challans WHERE challan_number LIKE $1`,
    [`VC/${fy}/%`]
  );
  const seq = (parseInt(r.rows[0].count) + 1).toString().padStart(4, "0");
  return `VC/${fy}/${seq}`;
}

function durationMonthsToStart(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

// ── LIST ──────────────────────────────────────────────────────────────────────
router.get("/vendor-challans", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { search = "", vendor = "", challanType = "", status = "", dateFrom = "", dateTo = "", page = "1", limit = "20" } = req.query as Record<string, string>;
    const pg = Math.max(1, parseInt(page, 10));
    const lim = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pg - 1) * lim;

    const conditions: string[] = ["is_deleted = false"];
    const params: (string | number)[] = [];

    if (search) {
      params.push(`%${search}%`);
      const n = params.length;
      conditions.push(`(challan_number ILIKE $${n} OR vendor_name ILIKE $${n} OR description ILIKE $${n})`);
    }
    if (vendor) { params.push(parseInt(vendor, 10)); conditions.push(`vendor_id = $${params.length}`); }
    if (challanType) { params.push(challanType); conditions.push(`challan_type = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    if (dateFrom) { params.push(dateFrom); conditions.push(`challan_date >= $${params.length}`); }
    if (dateTo) { params.push(dateTo); conditions.push(`challan_date <= $${params.length}`); }

    const where = conditions.join(" AND ");
    const [rows, countRow] = await Promise.all([
      pool.query(`SELECT * FROM vendor_challans WHERE ${where} ORDER BY challan_date DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, lim, offset]),
      pool.query(`SELECT COUNT(*) FROM vendor_challans WHERE ${where}`, params),
    ]);
    res.json({ data: rows.rows, total: parseInt(countRow.rows[0].count), page: pg, limit: lim });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to fetch vendor challans" });
  }
});

// ── SINGLE ────────────────────────────────────────────────────────────────────
router.get("/vendor-challans/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const r = await pool.query(`SELECT * FROM vendor_challans WHERE id = $1 AND is_deleted = false`, [id]);
  if (!r.rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ data: r.rows[0] });
});

// ── CREATE ────────────────────────────────────────────────────────────────────
router.post("/vendor-challans", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userName = req.user?.email ?? "system";
    const { challanDate, vendorId, vendorName, challanType, referenceOrderId, description, quantity, unit, rate, amount, attachment, remarks } = req.body;
    if (!vendorId) { res.status(400).json({ error: "Vendor is required" }); return; }
    if (!challanDate) { res.status(400).json({ error: "Challan date is required" }); return; }
    if (!challanType) { res.status(400).json({ error: "Challan type is required" }); return; }

    const challanNumber = await nextChallanNumber();
    const r = await pool.query(
      `INSERT INTO vendor_challans
         (challan_number, challan_date, vendor_id, vendor_name, challan_type,
          reference_order_id, description, quantity, unit, rate, amount,
          attachment, status, remarks, created_by, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Draft',$13,$14,NOW(),NOW())
       RETURNING *`,
      [challanNumber, challanDate, vendorId, vendorName ?? null, challanType,
       referenceOrderId ?? null, description ?? null, quantity ?? null, unit ?? null,
       rate ?? null, amount ?? null, attachment ? JSON.stringify(attachment) : null,
       remarks ?? null, userName]
    );
    res.status(201).json({ data: r.rows[0] });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to create vendor challan" });
  }
});

// ── UPDATE ────────────────────────────────────────────────────────────────────
router.put("/vendor-challans/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  try {
    const existing = await pool.query(`SELECT status FROM vendor_challans WHERE id = $1 AND is_deleted = false`, [id]);
    if (!existing.rows[0]) { res.status(404).json({ error: "Not found" }); return; }
    if (!["Draft"].includes(existing.rows[0].status)) {
      res.status(400).json({ error: "Only Draft challans can be edited" }); return;
    }
    const { challanDate, vendorId, vendorName, challanType, referenceOrderId, description, quantity, unit, rate, amount, attachment, remarks } = req.body;
    const r = await pool.query(
      `UPDATE vendor_challans SET
         challan_date=$1, vendor_id=$2, vendor_name=$3, challan_type=$4,
         reference_order_id=$5, description=$6, quantity=$7, unit=$8,
         rate=$9, amount=$10, attachment=$11, remarks=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [challanDate, vendorId, vendorName ?? null, challanType, referenceOrderId ?? null,
       description ?? null, quantity ?? null, unit ?? null, rate ?? null, amount ?? null,
       attachment ? JSON.stringify(attachment) : null, remarks ?? null, id]
    );
    res.json({ data: r.rows[0] });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to update vendor challan" });
  }
});

// ── DELETE (soft) ─────────────────────────────────────────────────────────────
router.delete("/vendor-challans/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const existing = await pool.query(`SELECT status FROM vendor_challans WHERE id=$1 AND is_deleted=false`, [id]);
  if (!existing.rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  if (!["Draft", "Cancelled"].includes(existing.rows[0].status)) {
    res.status(400).json({ error: "Only Draft or Cancelled challans can be deleted" }); return;
  }
  await pool.query(`UPDATE vendor_challans SET is_deleted=true, updated_at=NOW() WHERE id=$1`, [id]);
  res.json({ success: true });
});

// ── VERIFY ────────────────────────────────────────────────────────────────────
router.patch("/vendor-challans/:id/verify", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const existing = await pool.query(`SELECT status FROM vendor_challans WHERE id=$1 AND is_deleted=false`, [id]);
  if (!existing.rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.rows[0].status !== "Draft") {
    res.status(400).json({ error: "Only Draft challans can be verified" }); return;
  }
  const r = await pool.query(`UPDATE vendor_challans SET status='Verified', updated_at=NOW() WHERE id=$1 RETURNING *`, [id]);
  res.json({ data: r.rows[0] });
});

// ── CANCEL ────────────────────────────────────────────────────────────────────
router.patch("/vendor-challans/:id/cancel", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const existing = await pool.query(`SELECT status FROM vendor_challans WHERE id=$1 AND is_deleted=false`, [id]);
  if (!existing.rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  if (["Converted to PO", "Converted to PR", "Billed", "Paid", "Cancelled"].includes(existing.rows[0].status)) {
    res.status(400).json({ error: "Cannot cancel a challan in this status" }); return;
  }
  const r = await pool.query(`UPDATE vendor_challans SET status='Cancelled', updated_at=NOW() WHERE id=$1 RETURNING *`, [id]);
  res.json({ data: r.rows[0] });
});

// ── PREVIEW PO (fetch matching verified challans) ─────────────────────────────
router.post("/vendor-challans/preview-po", requireAuth, async (req, res) => {
  try {
    const { vendorId, challanType, durationMonths } = req.body as { vendorId: number; challanType: string; durationMonths: number };
    if (!vendorId || !challanType) { res.status(400).json({ error: "Vendor and Challan Type are required" }); return; }
    const dateFrom = durationMonthsToStart(durationMonths ?? 1);
    const r = await pool.query(
      `SELECT * FROM vendor_challans
       WHERE vendor_id=$1 AND challan_type=$2 AND status='Verified'
         AND is_deleted=false AND challan_date >= $3
       ORDER BY challan_date ASC`,
      [vendorId, challanType, dateFrom]
    );
    res.json({ data: r.rows, dateFrom });
  } catch (err) {
    req.log?.error(err);
    res.status(500).json({ error: "Failed to preview challans" });
  }
});

// ── CONVERT TO PO ─────────────────────────────────────────────────────────────
router.post("/vendor-challans/convert-to-po", requireAuth, async (req: AuthRequest, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { vendorId, vendorName, challanType, durationMonths } = req.body as {
      vendorId: number; vendorName: string; challanType: string; durationMonths: number;
    };
    if (!vendorId) { res.status(400).json({ error: "Vendor is required" }); return; }
    if (!challanType) { res.status(400).json({ error: "Challan Type is required" }); return; }

    const dateFrom = durationMonthsToStart(durationMonths ?? 1);
    const challans = await client.query(
      `SELECT * FROM vendor_challans
       WHERE vendor_id=$1 AND challan_type=$2 AND status='Verified'
         AND is_deleted=false AND challan_date >= $3
       ORDER BY challan_date ASC`,
      [vendorId, challanType, dateFrom]
    );
    if (!challans.rows.length) {
      await client.query("ROLLBACK");
      res.status(400).json({ error: "No eligible Verified challans found for this selection" }); return;
    }

    const fy = financialYear();
    const countRes = await client.query(`SELECT COUNT(*) FROM purchase_orders WHERE po_number LIKE $1`, [`PO/${fy}/%`]);
    const seq = (parseInt(countRes.rows[0].count) + 1).toString().padStart(4, "0");
    const poNumber = `PO/${fy}/${seq}`;
    const userName = req.user?.email ?? "system";
    const notes = `Consolidated from ${challans.rows.length} vendor challan(s) — Type: ${challanType}`;

    const poRes = await client.query(
      `INSERT INTO purchase_orders
         (po_number, vendor_id, vendor_name, po_date, status, notes,
          reference_type, reference_id, swatch_order_id, style_order_id,
          bom_row_ids, bom_items, created_by, created_at)
       VALUES ($1,$2,$3,NOW(),'Draft',$4,'Challan',NULL,NULL,NULL,'[]','[]',$5,NOW())
       RETURNING *`,
      [poNumber, vendorId, vendorName, notes, userName]
    );
    const po = poRes.rows[0];

    for (const ch of challans.rows) {
      await client.query(
        `INSERT INTO purchase_order_items
           (po_id, item_name, item_code, ordered_quantity, received_quantity, unit_price, remarks)
         VALUES ($1,$2,$3,$4,0,$5,$6)`,
        [
          po.id,
          ch.description ?? ch.challan_type,
          ch.challan_number,
          ch.quantity ?? 1,
          ch.rate ?? 0,
          `Challan: ${ch.challan_number} | Date: ${ch.challan_date}`,
        ]
      );
      await client.query(
        `UPDATE vendor_challans SET status='Converted to PO', linked_po_id=$1, linked_po_number=$2, updated_at=NOW() WHERE id=$3`,
        [po.id, poNumber, ch.id]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({
      data: po,
      message: `Vendor challans converted to PO successfully`,
      poNumber,
      count: challans.rows.length,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    req.log?.error(err);
    res.status(500).json({ error: "Failed to convert challans to PO" });
  } finally {
    client.release();
  }
});

// ── DOCUMENT UPLOAD ───────────────────────────────────────────────────────────
router.post("/vendor-challans/:id/document", requireAuth, uploadMiddleware.single("file"), async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const existing = await pool.query(`SELECT status, attachment FROM vendor_challans WHERE id=$1 AND is_deleted=false`, [id]);
  if (!existing.rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

  const old = existing.rows[0].attachment as { url?: string } | null;
  if (old?.url) {
    try { await deleteUpload(old.url); } catch { /* ignore */ }
  }

  const url = await uploadFile(req.file, { entity: "vendor-challans", id: String(id), category: "document" });
  const attachment = { url, originalName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size };
  const r = await pool.query(
    `UPDATE vendor_challans SET attachment=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
    [JSON.stringify(attachment), id]
  );
  res.json({ data: r.rows[0] });
});

// ── DOCUMENT DELETE ───────────────────────────────────────────────────────────
router.delete("/vendor-challans/:id/document", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const existing = await pool.query(`SELECT attachment FROM vendor_challans WHERE id=$1 AND is_deleted=false`, [id]);
  if (!existing.rows[0]) { res.status(404).json({ error: "Not found" }); return; }

  const att = existing.rows[0].attachment as { url?: string } | null;
  if (att?.url) {
    try { await deleteUpload(att.url); } catch { /* ignore */ }
  }
  await pool.query(`UPDATE vendor_challans SET attachment=NULL, updated_at=NOW() WHERE id=$1`, [id]);
  res.json({ success: true });
});

export default router;
