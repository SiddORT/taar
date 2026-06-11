/**
 * Shared money-math for vendor bill (vendor_invoice_ledger) balances.
 *
 * Mirrors the canonical currency rule used for client invoices (see invoiceBalances.ts):
 *  - A bill's balances (total/paid/pending) are kept in the BILL's own currency.
 *  - Every vendor payment stores `base_currency_amount` = amount × exchange_rate (INR anchor).
 *  - To apply a payment to a bill, convert it into the bill currency via the INR anchor:
 *        paid_in_bill_ccy = SUM(base_currency_amount) ÷ bill.exchange_rate_snapshot
 *  - paid/pending are RECOMPUTED from the sum of the bill's non-deleted payments — never
 *    by incrementally adding/subtracting raw amounts.
 *  - `pending_amount` is a GENERATED column (vendor_invoice_amount − paid_amount), so we
 *    only persist `paid_amount` + `status`; the DB derives pending automatically.
 *
 * Same-currency INR→INR (rate = 1) reduces to plain arithmetic, so existing behaviour is unchanged.
 */

interface Queryable {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
}

export interface VendorBillBalances {
  totalAmount: number; // bill currency
  paidAmount: number; // bill currency
  pendingAmount: number; // bill currency
  status: string;
}

/**
 * Recompute and persist a vendor bill's paid balance from the single source of truth
 * (its non-deleted vendor_payments linked via vendor_invoice_ledger_id), converting the
 * INR anchor total back into the bill's own currency. Returns the balances, or null if not found.
 */
export async function recomputeVendorBillBalances(
  client: Queryable,
  billId: number,
): Promise<VendorBillBalances | null> {
  const billRes = await client.query(
    `SELECT vendor_invoice_amount, exchange_rate_snapshot, legacy_paid_base, status
       FROM vendor_invoice_ledger
      WHERE id = $1`,
    [billId],
  );
  if (!billRes.rows.length) return null;
  const bill = billRes.rows[0];
  const billRate = parseFloat(bill.exchange_rate_snapshot ?? "1") || 1;
  const totalAmt = parseFloat(bill.vendor_invoice_amount ?? "0");
  // Opening balance (INR) for payments that predate the payment->bill link.
  const legacyBaseInr = parseFloat(bill.legacy_paid_base ?? "0") || 0;

  const payRes = await client.query(
    `SELECT COALESCE(SUM(base_currency_amount), 0) AS base_sum
       FROM vendor_payments
      WHERE vendor_invoice_ledger_id = $1 AND is_deleted = false`,
    [billId],
  );
  const basePaidInr = legacyBaseInr + parseFloat(payRes.rows[0].base_sum);
  const paid = parseFloat((basePaidInr / billRate).toFixed(2));
  const pending = parseFloat(Math.max(0, totalAmt - paid).toFixed(2));
  // Status is PURE from recomputed values — never fall back to the prior status,
  // otherwise removing all payments from a fully-paid bill would wrongly stay "Paid".
  const status = pending <= 0.005 ? "Paid" : paid > 0 ? "Partially Paid" : "Unpaid";

  await client.query(
    `UPDATE vendor_invoice_ledger SET paid_amount = $1, status = $2, updated_at = NOW() WHERE id = $3`,
    [paid.toFixed(2), status, billId],
  );

  return { totalAmount: totalAmt, paidAmount: paid, pendingAmount: pending, status };
}
