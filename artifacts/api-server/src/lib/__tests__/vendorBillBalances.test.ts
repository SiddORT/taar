import { describe, it, expect, vi } from "vitest";
import { recomputeVendorBillBalances } from "../vendorBillBalances";

// ---------------------------------------------------------------------------
// Helper: build a mock Queryable that returns pre-canned results in sequence.
// Call order for recomputeVendorBillBalances:
//   1) SELECT bill row (vendor_invoice_amount, exchange_rate_snapshot, legacy_paid_base, status)
//   2) SELECT COALESCE(SUM(base_currency_amount)) FROM vendor_payments
//   3) UPDATE vendor_invoice_ledger  (result not used)
// ---------------------------------------------------------------------------
function makeClient(
  billRow: Record<string, string> | null,
  payBase: number,
) {
  const responses = [
    { rows: billRow ? [billRow] : [] },
    { rows: [{ base_sum: String(payBase) }] },
    { rows: [] },
  ];
  let call = 0;
  return { query: vi.fn().mockImplementation(() => Promise.resolve(responses[call++])) };
}

function billRow(
  total: number,
  rate: number,
  legacyBase = 0,
  status = "Unpaid",
): Record<string, string> {
  return {
    vendor_invoice_amount: String(total),
    exchange_rate_snapshot: String(rate),
    legacy_paid_base: String(legacyBase),
    status,
  };
}

// ---------------------------------------------------------------------------
// recomputeVendorBillBalances
// ---------------------------------------------------------------------------
describe("recomputeVendorBillBalances", () => {
  it("returns null when bill is not found", async () => {
    const client = makeClient(null, 0);
    const result = await recomputeVendorBillBalances(client, 99);
    expect(result).toBeNull();
    expect(client.query).toHaveBeenCalledOnce();
  });

  // ── 1. INR → INR (rate = 1) full single payment ─────────────────────────
  it("INR→INR: single payment covering full amount → Paid", async () => {
    const client = makeClient(billRow(5000, 1), 5000);
    const result = await recomputeVendorBillBalances(client, 1);
    expect(result).toEqual({
      totalAmount: 5000,
      paidAmount: 5000,
      pendingAmount: 0,
      status: "Paid",
    });
  });

  it("INR→INR: no payments → Unpaid", async () => {
    const client = makeClient(billRow(5000, 1), 0);
    const result = await recomputeVendorBillBalances(client, 2);
    expect(result?.status).toBe("Unpaid");
    expect(result?.paidAmount).toBe(0);
    expect(result?.pendingAmount).toBe(5000);
  });

  it("INR→INR: partial payment → Partially Paid", async () => {
    const client = makeClient(billRow(5000, 1), 2500);
    const result = await recomputeVendorBillBalances(client, 3);
    expect(result?.status).toBe("Partially Paid");
    expect(result?.paidAmount).toBe(2500);
    expect(result?.pendingAmount).toBe(2500);
  });

  // ── 2. Foreign-currency payment on a foreign-currency bill ───────────────
  it("foreign currency: partial payment → Partially Paid", async () => {
    // Bill: 100 USD at rate 83 → INR anchor = 8300
    // Payment: 50 USD → base = 4150 INR
    const client = makeClient(billRow(100, 83), 4150);
    const result = await recomputeVendorBillBalances(client, 4);
    expect(result?.paidAmount).toBe(50);     // 4150 ÷ 83
    expect(result?.pendingAmount).toBe(50);
    expect(result?.status).toBe("Partially Paid");
  });

  it("foreign currency: full payment → Paid", async () => {
    // Bill: 100 USD at rate 83; payment = 8300 INR (100 USD full)
    const client = makeClient(billRow(100, 83), 8300);
    const result = await recomputeVendorBillBalances(client, 5);
    expect(result?.paidAmount).toBe(100);
    expect(result?.pendingAmount).toBe(0);
    expect(result?.status).toBe("Paid");
  });

  // ── 3. Over-pay guard (pending clamped to 0) ─────────────────────────────
  it("over-pay guard: pending never goes negative", async () => {
    const client = makeClient(billRow(1000, 1), 1500);
    const result = await recomputeVendorBillBalances(client, 6);
    expect(result?.paidAmount).toBe(1500);
    expect(result?.pendingAmount).toBe(0);   // clamped
    expect(result?.status).toBe("Paid");
  });

  // ── 4a. Payment delete: Paid → Partially Paid ────────────────────────────
  it("payment delete: removing one payment reverts Paid → Partially Paid", async () => {
    // Bill 1000; after deleting a payment, only 600 base remains.
    const client = makeClient(billRow(1000, 1, 0, "Paid"), 600);
    const result = await recomputeVendorBillBalances(client, 7);
    expect(result?.status).toBe("Partially Paid");
    expect(result?.paidAmount).toBe(600);
    expect(result?.pendingAmount).toBe(400);
  });

  // ── 4b. Payment delete: Partially Paid → Unpaid ──────────────────────────
  it("payment delete: removing all payments reverts Partially Paid → Unpaid", async () => {
    const client = makeClient(billRow(1000, 1, 0, "Partially Paid"), 0);
    const result = await recomputeVendorBillBalances(client, 8);
    expect(result?.status).toBe("Unpaid");
    expect(result?.paidAmount).toBe(0);
    expect(result?.pendingAmount).toBe(1000);
  });

  // ── 4c. Full cycle: Paid → delete all → Unpaid ───────────────────────────
  it("full status revert cycle: was Paid, all payments removed → Unpaid", async () => {
    const client = makeClient(billRow(2000, 1, 0, "Paid"), 0);
    const result = await recomputeVendorBillBalances(client, 9);
    expect(result?.status).toBe("Unpaid");
  });

  // ── 5. Legacy paid base (opening balance) ────────────────────────────────
  it("legacy_paid_base: adds INR opening balance to payment sum", async () => {
    // Bill 2000 INR rate 1; 500 INR legacy + 500 INR from new payments
    const client = makeClient(billRow(2000, 1, 500), 500);
    const result = await recomputeVendorBillBalances(client, 10);
    expect(result?.paidAmount).toBe(1000);
    expect(result?.pendingAmount).toBe(1000);
    expect(result?.status).toBe("Partially Paid");
  });

  it("legacy_paid_base alone covers full bill → Paid with no explicit payments", async () => {
    const client = makeClient(billRow(1000, 1, 1000), 0);
    const result = await recomputeVendorBillBalances(client, 11);
    expect(result?.paidAmount).toBe(1000);
    expect(result?.pendingAmount).toBe(0);
    expect(result?.status).toBe("Paid");
  });

  it("legacy_paid_base with foreign-currency bill", async () => {
    // Bill 100 EUR at rate 90; legacy base = 4500 INR (50 EUR); new pay base = 4500 INR
    const client = makeClient(billRow(100, 90, 4500), 4500);
    const result = await recomputeVendorBillBalances(client, 12);
    expect(result?.paidAmount).toBe(100);  // (4500+4500)/90 = 100
    expect(result?.pendingAmount).toBe(0);
    expect(result?.status).toBe("Paid");
  });

  // ── 6. Boundary: pending ≤ 0.005 rounds to Paid ─────────────────────────
  it("tiny rounding residual (≤ 0.005) is treated as Paid", async () => {
    // Floating-point: 1000 paid out of 1000 with rate causing tiny diff
    const client = makeClient(billRow(1000, 1), 1000.004);
    const result = await recomputeVendorBillBalances(client, 13);
    expect(result?.status).toBe("Paid");
  });

  // ── 7. UPDATE call uses correct SQL values ────────────────────────────────
  it("persists the correct paid_amount and status via UPDATE", async () => {
    const client = makeClient(billRow(800, 1), 800);
    await recomputeVendorBillBalances(client, 14);
    const updateCall = client.query.mock.calls[2];
    // $1 = paid_amount, $2 = status, $3 = id
    expect(updateCall[1]).toEqual(["800.00", "Paid", 14]);
  });
});
