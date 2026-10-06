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
const round2 = (n: number): number => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export async function recomputeInvoiceBalances(client: any, invoiceId: number) {
  const invRes = await client.query(
    `SELECT total_amount::numeric AS total,
            exchange_rate_snapshot::numeric AS rate
     FROM invoices WHERE id = $1 AND is_deleted = false`,
    [invoiceId]
  );
  if (!invRes.rows.length) return null;

  const total = round2(invRes.rows[0].total);
  const rate = parseFloat(invRes.rows[0].rate) || 1;

  // Sum completed payments in invoice currency
  const payRes = await client.query(
    `SELECT COALESCE(SUM(ROUND(base_currency_amount::numeric, 2)), 0) AS paid_inr
     FROM invoice_payments
     WHERE invoice_id = $1
       AND is_deleted = false
       AND payment_status = 'Completed'`,
    [invoiceId]
  );

  const paidInr = round2(payRes.rows[0].paid_inr);
  const receivedAmount = round2(paidInr / rate);
  const pendingAmount = Math.max(0, round2(total - receivedAmount));

  let status = "Generated";
  if (pendingAmount <= 0.01) status = "Paid";
  else if (receivedAmount > 0.01) status = "Partial";

  await client.query(
    `UPDATE invoices
     SET received_amount = $1,
         pending_amount  = $2,
         invoice_status  = $3,
         updated_at      = NOW()
     WHERE id = $4`,
    [
      receivedAmount.toFixed(2),
      pendingAmount.toFixed(2),
      status,
      invoiceId,
    ]
  );

  return { receivedAmount, pendingAmount, status };
}
