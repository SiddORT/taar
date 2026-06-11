/**
 * Pure math helpers for the procurement module.
 *
 * Extracted so they can be unit-tested independently of the database and HTTP layer.
 * These functions are the single source of truth for procurement numeric logic and are
 * imported directly by accountPurchases.ts and purchaseReceipts.ts.
 *
 * Currency rule (mirrors invoiceBalances.ts / vendorBillBalances.ts):
 *  - Every payment stores base_currency_amount = amount × exchange_rate (INR anchor).
 *  - To convert a payment into a bill's own currency:
 *      amtInBillCcy = (amt × payRate) ÷ billRate
 *  - pending = max(0, billTotal − prevPaid − amtInBillCcy)
 */

// ─── Purchase Order totals ────────────────────────────────────────────────────

/**
 * Compute the line total for a single PO item.
 * Both inputs are expected to be non-negative; returns 0 when either is NaN.
 */
export function computePoLineTotal(qty: number, unitPrice: number): number {
  const q = isFinite(qty) ? qty : 0;
  const p = isFinite(unitPrice) ? unitPrice : 0;
  return q * p;
}

/**
 * Compute the grand total for a PO from its line items.
 */
export function computePoTotal(
  items: Array<{ qty: number; unitPrice: number }>,
): number {
  return items.reduce((sum, it) => sum + computePoLineTotal(it.qty, it.unitPrice), 0);
}

// ─── Purchase Receipt / inventory update ─────────────────────────────────────

/**
 * Weighted-average price after receiving new stock.
 *
 * Formula: ((prevStock × prevAvg) + (inQty × unitPrice)) / newStock
 * When newStock ≤ 0 the unit price of the incoming batch is returned as the
 * new average (avoids division-by-zero).
 *
 * @param prevStock  Existing stock quantity before receipt
 * @param prevAvg    Current average purchase price
 * @param inQty      Quantity being received
 * @param unitPrice  Unit price of the incoming batch
 */
export function computeNewAveragePrice(
  prevStock: number,
  prevAvg: number,
  inQty: number,
  unitPrice: number,
): number {
  const newStock = prevStock + inQty;
  if (newStock <= 0) return unitPrice;
  return ((prevStock * prevAvg) + (inQty * unitPrice)) / newStock;
}

/**
 * Available stock = total stock minus all reserved quantities, clamped to 0.
 *
 * @param newStock   Total physical stock after the transaction
 * @param styleRes   Quantity reserved for style orders
 * @param swatchRes  Quantity reserved for swatch orders
 */
export function computeAvailableStock(
  newStock: number,
  styleRes: number,
  swatchRes: number,
): number {
  return Math.max(0, newStock - styleRes - swatchRes);
}

// ─── Vendor bill payment math ─────────────────────────────────────────────────

/**
 * Convert a payment amount into the bill's own currency via the INR anchor.
 *
 * @param amt      Payment amount in the payment currency
 * @param payRate  Payment currency → INR rate  (1 for INR payments)
 * @param billRate Bill currency → INR rate      (1 for INR bills)
 */
export function convertPaymentToBillCcy(
  amt: number,
  payRate: number,
  billRate: number,
): number {
  const rate = billRate > 0 ? billRate : 1;
  return (amt * payRate) / rate;
}

/**
 * Return true if the payment would exceed the remaining balance on the bill
 * (with a ₹0.01 tolerance for floating-point residuals).
 *
 * @param amtInBillCcy  Payment amount already converted to bill currency
 * @param billTotal     Total invoice amount in bill currency
 * @param prevPaid      Amount already paid in bill currency
 */
export function isOverpayment(
  amtInBillCcy: number,
  billTotal: number,
  prevPaid: number,
): boolean {
  const remaining = billTotal - prevPaid;
  return amtInBillCcy > remaining + 0.01;
}
