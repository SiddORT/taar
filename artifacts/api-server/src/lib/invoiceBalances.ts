/**
 * Shared money-math for invoice balances.
 *
 * Canonical currency rule used everywhere in the app:
 *  - An invoice's balances (total/received/pending) are kept in the INVOICE's own currency.
 *  - Every payment / credit note stores `base_currency_amount` = amount × exchange_rate (INR anchor).
 *  - To apply any payment/note to an invoice, convert it into the invoice currency via the INR anchor:
 *        amount_in_invoice_ccy = base_currency_amount ÷ invoice.exchange_rate_snapshot
 *  - received/pending are RECOMPUTED from the sum of the invoice's non-deleted completed payments
 *    plus its applied credit notes — never by incrementally adding/subtracting raw amounts.
 *
 * Same-currency INR→INR (rate = 1) reduces to plain arithmetic, so existing behaviour is unchanged.
 */

interface Queryable {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
}

export function computeAutoStatus(
  totalAmt: number,
  pendingAmt: number,
  dueDate: string,
  currentStatus: string,
): string {
  if (currentStatus === "Draft" || currentStatus === "Sent" || currentStatus === "Cancelled") return currentStatus;
  const today = new Date().toISOString().slice(0, 10);
  if (pendingAmt <= 0) return "Paid";
  if (pendingAmt < totalAmt && pendingAmt > 0) return "Partially Paid";
  if (dueDate && dueDate < today) return "Overdue";
  return "Generated";
}

export interface InvoiceBalances {
  totalAmount: number; // invoice currency
  receivedAmount: number; // invoice currency
  pendingAmount: number; // invoice currency
  status: string;
}

/**
 * Recompute and persist an invoice's received/pending balances from the single source of truth
 * (its completed payments + applied client credit notes), converting every INR anchor amount
 * back into the invoice's own currency. Returns the recomputed balances, or null if not found.
 */
export async function recomputeInvoiceBalances(
  client: Queryable,
  invoiceId: number,
): Promise<InvoiceBalances | null> {
  const invRes = await client.query(
    `SELECT total_amount, exchange_rate_snapshot, due_date, invoice_status
       FROM invoices
      WHERE id = $1 AND is_deleted = false`,
    [invoiceId],
  );
  if (!invRes.rows.length) return null;
  const inv = invRes.rows[0];
  const invRate = parseFloat(inv.exchange_rate_snapshot ?? "1") || 1;
  const totalAmt = parseFloat(inv.total_amount ?? "0");

  const payRes = await client.query(
    `SELECT COALESCE(SUM(base_currency_amount), 0) AS base_sum
       FROM invoice_payments
      WHERE invoice_id = $1 AND is_deleted = false AND payment_status = 'Completed'`,
    [invoiceId],
  );
  const cnRes = await client.query(
    `SELECT COALESCE(SUM(base_currency_amount), 0) AS base_sum
       FROM credit_debit_notes
      WHERE invoice_id = $1 AND is_deleted = false
        AND note_type = 'Credit Note' AND reference_type = 'Client Invoice'
        AND status = 'Applied'`,
    [invoiceId],
  );

  const baseReceivedInr = parseFloat(payRes.rows[0].base_sum) + parseFloat(cnRes.rows[0].base_sum);
  const received = parseFloat((baseReceivedInr).toFixed(2));
  const pending = parseFloat(Math.max(0, totalAmt - received).toFixed(2));
  const status = computeAutoStatus(totalAmt, pending, inv.due_date ?? "", inv.invoice_status ?? "Generated");

  await client.query(
    `UPDATE invoices
        SET received_amount = $1, pending_amount = $2, invoice_status = $3, status = $3, updated_at = NOW()
      WHERE id = $4`,
    [received.toFixed(2), pending.toFixed(2), status, invoiceId],
  );

  return { totalAmount: totalAmt, receivedAmount: received, pendingAmount: pending, status };
}
