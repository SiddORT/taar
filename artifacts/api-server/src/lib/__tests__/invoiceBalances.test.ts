import { describe, it, expect, vi, beforeEach } from "vitest";
import { recomputeInvoiceBalances, computeAutoStatus } from "../invoiceBalances";

// ---------------------------------------------------------------------------
// Helper: build a mock Queryable that returns pre-canned results in sequence.
// Call order matches the function's internal query sequence:
//   1) SELECT invoice row
//   2) SELECT SUM(base_currency_amount) FROM invoice_payments
//   3) SELECT SUM(base_currency_amount) FROM credit_debit_notes
//   4) UPDATE invoices  (result is not used by the caller)
// ---------------------------------------------------------------------------
function makeClient(
  invoiceRow: Record<string, string> | null,
  payBase: number,
  cnBase: number,
) {
  const responses = [
    { rows: invoiceRow ? [invoiceRow] : [] },
    { rows: [{ base_sum: String(payBase) }] },
    { rows: [{ base_sum: String(cnBase) }] },
    { rows: [] },
  ];
  let call = 0;
  return { query: vi.fn().mockImplementation(() => Promise.resolve(responses[call++])) };
}

// Far-future due date so status never falls into "Overdue" unless we want it to.
const FUTURE = "2099-12-31";
const PAST   = "2000-01-01";

// ---------------------------------------------------------------------------
// computeAutoStatus – pure function, no DB
// ---------------------------------------------------------------------------
describe("computeAutoStatus", () => {
  it("passes through Draft unchanged", () => {
    expect(computeAutoStatus(1000, 500, FUTURE, "Draft")).toBe("Draft");
  });

  it("passes through Sent unchanged", () => {
    expect(computeAutoStatus(1000, 500, FUTURE, "Sent")).toBe("Sent");
  });

  it("passes through Cancelled unchanged", () => {
    expect(computeAutoStatus(1000, 0, FUTURE, "Cancelled")).toBe("Cancelled");
  });

  it("returns Paid when pending <= 0", () => {
    expect(computeAutoStatus(1000, 0, FUTURE, "Generated")).toBe("Paid");
  });

  it("returns Partially Paid when 0 < pending < total", () => {
    expect(computeAutoStatus(1000, 400, FUTURE, "Generated")).toBe("Partially Paid");
  });

  it("returns Overdue when pending equals total and due date is past", () => {
    expect(computeAutoStatus(1000, 1000, PAST, "Generated")).toBe("Overdue");
  });

  it("returns Generated when pending equals total and due date is in the future", () => {
    expect(computeAutoStatus(1000, 1000, FUTURE, "Generated")).toBe("Generated");
  });
});

// ---------------------------------------------------------------------------
// recomputeInvoiceBalances
// ---------------------------------------------------------------------------
describe("recomputeInvoiceBalances", () => {
  it("returns null when invoice is not found", async () => {
    const client = makeClient(null, 0, 0);
    const result = await recomputeInvoiceBalances(client, 99);
    expect(result).toBeNull();
    expect(client.query).toHaveBeenCalledOnce();
  });

  // ── 1. INR → INR (rate = 1) full single payment ────────────────────────
  it("INR→INR: marks invoice Paid when one payment covers the full amount", async () => {
    const client = makeClient(
      { total_amount: "1000", exchange_rate_snapshot: "1", due_date: FUTURE, invoice_status: "Generated" },
      1000, // pay base
      0,    // credit note base
    );
    const result = await recomputeInvoiceBalances(client, 1);
    expect(result).toEqual({
      totalAmount: 1000,
      receivedAmount: 1000,
      pendingAmount: 0,
      status: "Paid",
    });
  });

  // ── 2. Foreign-currency payment applied to a foreign-currency invoice ──
  it("foreign currency: partial payment yields Partially Paid", async () => {
    // Invoice is 100 USD at rate 83 → INR anchor = 8300
    // One payment of 50 USD at same rate → base = 4150 INR
    const client = makeClient(
      { total_amount: "100", exchange_rate_snapshot: "83", due_date: FUTURE, invoice_status: "Generated" },
      4150, // pay base (50 USD × 83)
      0,
    );
    const result = await recomputeInvoiceBalances(client, 2);
    expect(result?.receivedAmount).toBe(50);        // 4150 ÷ 83 = 50 USD
    expect(result?.pendingAmount).toBe(50);
    expect(result?.status).toBe("Partially Paid");
  });

  it("foreign currency: full payment yields Paid", async () => {
    // Invoice 100 USD at rate 83; payment covers full 100 USD
    const client = makeClient(
      { total_amount: "100", exchange_rate_snapshot: "83", due_date: FUTURE, invoice_status: "Generated" },
      8300,
      0,
    );
    const result = await recomputeInvoiceBalances(client, 3);
    expect(result?.receivedAmount).toBe(100);
    expect(result?.pendingAmount).toBe(0);
    expect(result?.status).toBe("Paid");
  });

  // ── 3. Over-pay guard (pending is clamped to 0) ─────────────────────────
  it("over-pay guard: pending never goes below 0", async () => {
    const client = makeClient(
      { total_amount: "1000", exchange_rate_snapshot: "1", due_date: FUTURE, invoice_status: "Generated" },
      1500, // base > total
      0,
    );
    const result = await recomputeInvoiceBalances(client, 4);
    expect(result?.receivedAmount).toBe(1500);
    expect(result?.pendingAmount).toBe(0);  // clamped
    expect(result?.status).toBe("Paid");
  });

  // ── 4a. Payment delete: Paid → Partially Paid ───────────────────────────
  it("payment delete: removes a payment, status reverts from Paid to Partially Paid", async () => {
    // Invoice 1000, two payments of 500. After deleting one, base_sum = 500.
    const client = makeClient(
      { total_amount: "1000", exchange_rate_snapshot: "1", due_date: FUTURE, invoice_status: "Paid" },
      500,
      0,
    );
    const result = await recomputeInvoiceBalances(client, 5);
    expect(result?.status).toBe("Partially Paid");
    expect(result?.pendingAmount).toBe(500);
  });

  // ── 4b. Payment delete: Partially Paid → Generated ──────────────────────
  it("payment delete: removes all payments, status reverts to Generated", async () => {
    const client = makeClient(
      { total_amount: "1000", exchange_rate_snapshot: "1", due_date: FUTURE, invoice_status: "Partially Paid" },
      0,
      0,
    );
    const result = await recomputeInvoiceBalances(client, 6);
    expect(result?.status).toBe("Generated");
    expect(result?.receivedAmount).toBe(0);
    expect(result?.pendingAmount).toBe(1000);
  });

  // ── 4c. Overdue when all payments removed and due date is past ───────────
  it("payment delete: reverts to Overdue when all payments gone and due date is past", async () => {
    const client = makeClient(
      { total_amount: "1000", exchange_rate_snapshot: "1", due_date: PAST, invoice_status: "Partially Paid" },
      0,
      0,
    );
    const result = await recomputeInvoiceBalances(client, 7);
    expect(result?.status).toBe("Overdue");
  });

  // ── 5. Applied credit notes ─────────────────────────────────────────────
  it("credit note: credit note base adds to received amount", async () => {
    const client = makeClient(
      { total_amount: "1000", exchange_rate_snapshot: "1", due_date: FUTURE, invoice_status: "Generated" },
      400, // payment base
      600, // credit note base
    );
    const result = await recomputeInvoiceBalances(client, 8);
    expect(result?.receivedAmount).toBe(1000);  // 400 + 600 = 1000
    expect(result?.pendingAmount).toBe(0);
    expect(result?.status).toBe("Paid");
  });

  it("credit note: partial credit note leaves Partially Paid", async () => {
    const client = makeClient(
      { total_amount: "1000", exchange_rate_snapshot: "1", due_date: FUTURE, invoice_status: "Generated" },
      200,
      300,
    );
    const result = await recomputeInvoiceBalances(client, 9);
    expect(result?.receivedAmount).toBe(500);
    expect(result?.pendingAmount).toBe(500);
    expect(result?.status).toBe("Partially Paid");
  });

  it("credit note: foreign-currency invoice with credit note", async () => {
    // 100 EUR at rate 90; credit note = 4500 INR (50 EUR worth)
    const client = makeClient(
      { total_amount: "100", exchange_rate_snapshot: "90", due_date: FUTURE, invoice_status: "Generated" },
      0,
      4500, // CN base
    );
    const result = await recomputeInvoiceBalances(client, 10);
    expect(result?.receivedAmount).toBe(50);   // 4500 ÷ 90
    expect(result?.pendingAmount).toBe(50);
    expect(result?.status).toBe("Partially Paid");
  });

  it("persists the correct values to the DB via UPDATE", async () => {
    const client = makeClient(
      { total_amount: "500", exchange_rate_snapshot: "1", due_date: FUTURE, invoice_status: "Generated" },
      500,
      0,
    );
    await recomputeInvoiceBalances(client, 11);
    const updateCall = client.query.mock.calls[3];
    // $1 = received, $2 = pending, $3 = status, $4 = id
    expect(updateCall[1]).toEqual(["500.00", "0.00", "Paid", 11]);
  });
});
