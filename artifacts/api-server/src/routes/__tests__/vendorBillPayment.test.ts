/**
 * API-level tests for POST /account-purchases/vendor-bills/:id/payment
 *
 * These tests mount the accountPurchases router on a minimal Express app with
 * all external dependencies (DB pool, auth, recomputeVendorBillBalances) mocked,
 * so the DB is never touched. The focus is on the HTTP → business-logic bridge:
 *  - Cross-currency payment conversion (INR anchor)
 *  - Over-payment guard
 *  - Validation of the payment_amount field
 *  - Correct sequencing of DB calls (BEGIN, INSERT, recompute, COMMIT / ROLLBACK)
 *  - Pool client is always released (no connection leaks)
 */
import { vi, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
const { mockClientQuery, mockRelease, mockConnect, mockRecompute } = vi.hoisted(() => ({
  mockClientQuery: vi.fn(),
  mockRelease: vi.fn(),
  mockConnect: vi.fn(),
  mockRecompute: vi.fn(),
}));

// ─── Mock @workspace/db ───────────────────────────────────────────────────────
vi.mock("@workspace/db", () => ({
  pool: { connect: mockConnect, query: vi.fn() },
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
  },
}));

// ─── Bypass JWT auth ──────────────────────────────────────────────────────────
vi.mock("../../middlewares/requireAuth", () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { user: unknown }).user = { userId: 1, email: "tester@example.com", role: "admin" };
    next();
  },
}));

// ─── Spy on recomputeVendorBillBalances ───────────────────────────────────────
vi.mock("../../lib/vendorBillBalances", () => ({
  recomputeVendorBillBalances: mockRecompute,
}));

import accountPurchasesRouter from "../accountPurchases";

// ─── Test app factory ─────────────────────────────────────────────────────────
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(accountPurchasesRouter);
  return app;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the canonical client-query sequence for a successful payment.
 *
 * call 0 → BEGIN
 * call 1 → SELECT ... FOR UPDATE  (returns the bill row)
 * call 2 → INSERT INTO vendor_payments
 * call 3 → (recomputeVendorBillBalances is called — handled via mockRecompute)
 * call 4 → COMMIT
 */
function configureSuccessfulClient(billRow: Record<string, string>) {
  mockClientQuery
    .mockResolvedValueOnce({ rows: [] })           // BEGIN
    .mockResolvedValueOnce({ rows: [billRow] })    // SELECT bill FOR UPDATE
    .mockResolvedValueOnce({ rows: [] })           // INSERT vendor_payments
    .mockResolvedValueOnce({ rows: [] });          // COMMIT
}

function inrBill(total: number, paid = 0): Record<string, string> {
  return {
    id: "1",
    vendor_id: "10",
    vendor_name: "Test Vendor",
    vendor_invoice_amount: String(total),
    paid_amount: String(paid),
    exchange_rate_snapshot: "1",
    status: paid === 0 ? "Unpaid" : "Partially Paid",
  };
}

function usdBill(total: number, rateToInr: number, paid = 0): Record<string, string> {
  return {
    id: "2",
    vendor_id: "11",
    vendor_name: "USD Vendor",
    vendor_invoice_amount: String(total),
    paid_amount: String(paid),
    exchange_rate_snapshot: String(rateToInr),
    status: paid === 0 ? "Unpaid" : "Partially Paid",
  };
}

const recomputeResult = (total: number, paid: number) => ({
  totalAmount: total,
  paidAmount: paid,
  pendingAmount: total - paid,
  status: paid >= total ? "Paid" : paid > 0 ? "Partially Paid" : "Unpaid",
});

// ─── Default before-each ──────────────────────────────────────────────────────
beforeEach(() => {
  // resetAllMocks flushes unused once-queue entries *and* clears call history,
  // preventing leftover mockResolvedValueOnce() values from spilling into the
  // next test. After the reset, re-wire the two persistent mocks.
  vi.resetAllMocks();
  mockConnect.mockResolvedValue({
    query: mockClientQuery,
    release: mockRelease,
  });
  mockRecompute.mockResolvedValue(recomputeResult(1000, 500));
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("POST /vendor-bills/:id/payment", () => {

  // ── 1. INR payment on INR bill — happy path ───────────────────────────────
  it("records a valid INR payment and returns paid/pending/status", async () => {
    configureSuccessfulClient(inrBill(1000, 0));
    mockRecompute.mockResolvedValue(recomputeResult(1000, 600));

    const res = await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({
        payment_amount: "600",
        payment_date: "2026-06-01",
        payment_type: "Bank Transfer",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: "Payment recorded",
      paid: 600,
      pending: 400,
      status: "Partially Paid",
    });
    expect(mockRecompute).toHaveBeenCalledOnce();
  });

  // ── 2. Full payment clears the bill ───────────────────────────────────────
  it("full payment returns Paid status from recompute", async () => {
    configureSuccessfulClient(inrBill(1000, 0));
    mockRecompute.mockResolvedValue(recomputeResult(1000, 1000));

    const res = await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({
        payment_amount: "1000",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Paid");
    expect(res.body.pending).toBe(0);
  });

  // ── 3. Zero payment is rejected ───────────────────────────────────────────
  it("rejects payment_amount = 0 with 400", async () => {
    mockClientQuery.mockResolvedValueOnce({ rows: [] }); // BEGIN

    const res = await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({ payment_amount: "0" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid payment amount/i);
  });

  // ── 4. Negative payment is rejected ──────────────────────────────────────
  it("rejects negative payment_amount with 400", async () => {
    mockClientQuery.mockResolvedValueOnce({ rows: [] }); // BEGIN

    const res = await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({ payment_amount: "-100" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid payment amount/i);
  });

  // ── 5. Missing payment_amount treated as 0 → rejected ────────────────────
  it("rejects missing payment_amount (defaults to 0) with 400", async () => {
    mockClientQuery.mockResolvedValueOnce({ rows: [] }); // BEGIN

    const res = await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({ payment_type: "Cash" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid payment amount/i);
  });

  // ── 5b. Future payment date → 400 ─────────────────────────────────────────
  it("rejects a future payment_date with 400", async () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split("T")[0];
    mockClientQuery.mockResolvedValueOnce({ rows: [] }); // BEGIN

    const res = await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({
        payment_amount: "500",
        payment_date: tomorrow,
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/future/i);
    expect(mockRecompute).not.toHaveBeenCalled();
  });

  // ── 6. Over-payment guard — INR bill ──────────────────────────────────────
  it("rejects payment exceeding remaining balance on an INR bill", async () => {
    // Bill: ₹1000 total, ₹600 already paid → remaining = ₹400
    // The guard throws after the SELECT, so ROLLBACK uses the "INSERT" slot.
    // configureSuccessfulClient sets up BEGIN + SELECT + INSERT(unused as ROLLBACK) + COMMIT(leftover).
    // resetAllMocks() in beforeEach ensures the leftover COMMIT doesn't spill into the next test.
    configureSuccessfulClient(inrBill(1000, 600));

    const res = await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({
        payment_amount: "500",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/exceeds pending balance/i);
    expect(mockRecompute).not.toHaveBeenCalled();
  });

  // ── 7. Payment exactly equalling remaining balance is accepted ────────────
  it("accepts payment that exactly matches remaining balance", async () => {
    // Bill: ₹1000, ₹600 paid → remaining = ₹400; paying exactly ₹400
    configureSuccessfulClient(inrBill(1000, 600));
    mockRecompute.mockResolvedValue(recomputeResult(1000, 1000));

    const res = await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({
        payment_amount: "400",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Paid");
  });

  // ── 8. Cross-currency: USD payment on USD bill (same currency) ────────────
  it("cross-currency same-ccy: 100 USD on USD bill @ rate 83", async () => {
    // Bill: 200 USD at rate 83; 100 USD already paid → 100 remaining
    // Payment: 100 USD at rate 83 → baseAmt = 8300 INR; amtInBillCcy = 8300/83 = 100 USD
    configureSuccessfulClient(usdBill(200, 83, 100));
    mockRecompute.mockResolvedValue(recomputeResult(200, 200));

    const res = await request(makeApp())
      .post("/vendor-bills/2/payment")
      .send({
        payment_amount: "100",
        currency_code: "USD",
        exchange_rate_snapshot: "83",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Paid");
  });

  // ── 9. Cross-currency: INR payment on USD bill ────────────────────────────
  it("cross-currency: 8300 INR on a 100 USD bill (rate 83) clears the bill", async () => {
    // Bill: 100 USD at rate 83 (INR anchor = 8300)
    // Payment: 8300 INR (payRate = 1) → base = 8300 → amtInBillCcy = 8300/83 = 100 USD
    configureSuccessfulClient(usdBill(100, 83, 0));
    mockRecompute.mockResolvedValue(recomputeResult(100, 100));

    const res = await request(makeApp())
      .post("/vendor-bills/2/payment")
      .send({
        payment_amount: "8300",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Paid");
  });

  // ── 10. Cross-currency: over-payment guard on a foreign-currency bill ──────
  it("cross-currency: rejects INR payment that overpays a USD bill", async () => {
    // Bill: 100 USD at rate 83 (anchor = 8300 INR) — unpaid
    // Attempting to pay 9000 INR (> 8300 remaining + 0.01 tolerance)
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })                     // BEGIN
      .mockResolvedValueOnce({ rows: [usdBill(100, 83, 0)] }) // SELECT bill
      .mockResolvedValueOnce({ rows: [] });                    // ROLLBACK

    const res = await request(makeApp())
      .post("/vendor-bills/2/payment")
      .send({
        payment_amount: "9000",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/exceeds pending balance/i);
    expect(mockRecompute).not.toHaveBeenCalled();
  });

  // ── 11. Bill not found → 404 ──────────────────────────────────────────────
  it("returns 404 when the bill is not found", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })  // BEGIN
      .mockResolvedValueOnce({ rows: [] })  // SELECT → not found
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    const res = await request(makeApp())
      .post("/vendor-bills/999/payment")
      .send({ payment_amount: "100" });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/bill not found/i);
  });

  // ── 12. Pool client always released — success path ────────────────────────
  it("releases the pool client on a successful payment", async () => {
    configureSuccessfulClient(inrBill(1000, 0));

    await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({ payment_amount: "500", currency_code: "INR", exchange_rate_snapshot: "1" });

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 13. Pool client always released — error path ──────────────────────────
  it("releases the pool client even when payment is rejected", async () => {
    // Zero payment triggers the guard before BEGIN even matters, but connect is called first
    mockClientQuery.mockResolvedValueOnce({ rows: [] }); // BEGIN (may or may not be used)

    await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({ payment_amount: "0" });

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 14. DB error → ROLLBACK issued ───────────────────────────────────────
  it("issues ROLLBACK and returns 400 when the INSERT throws", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })              // BEGIN
      .mockResolvedValueOnce({ rows: [inrBill(1000)] }) // SELECT bill
      .mockRejectedValueOnce(new Error("DB insert fail")) // INSERT throws
      .mockResolvedValueOnce({ rows: [] });              // ROLLBACK

    const res = await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({ payment_amount: "500", currency_code: "INR", exchange_rate_snapshot: "1" });

    expect(res.status).toBe(400);
    const calls = mockClientQuery.mock.calls.map((c: unknown[]) => String(c[0]));
    expect(calls.some((sql: string) => sql.includes("ROLLBACK"))).toBe(true);
    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 16. Paid bill → 400 ──────────────────────────────────────────────────
  it("rejects payment on an already-Paid bill with 400", async () => {
    const paidBill: Record<string, string> = {
      ...inrBill(1000, 1000),
      status: "Paid",
    };
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })           // BEGIN
      .mockResolvedValueOnce({ rows: [paidBill] })   // SELECT bill FOR UPDATE
      .mockResolvedValueOnce({ rows: [] });           // ROLLBACK

    const res = await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({ payment_amount: "100", currency_code: "INR", exchange_rate_snapshot: "1" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already fully paid/i);
    expect(mockRecompute).not.toHaveBeenCalled();
  });

  // ── 17. Cancelled bill → 400 ─────────────────────────────────────────────
  it("rejects payment on a Cancelled bill with 400", async () => {
    const cancelledBill: Record<string, string> = {
      ...inrBill(1000, 0),
      status: "Cancelled",
    };
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })                // BEGIN
      .mockResolvedValueOnce({ rows: [cancelledBill] })   // SELECT bill FOR UPDATE
      .mockResolvedValueOnce({ rows: [] });                // ROLLBACK

    const res = await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({ payment_amount: "100", currency_code: "INR", exchange_rate_snapshot: "1" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cancelled/i);
    expect(mockRecompute).not.toHaveBeenCalled();
  });

  // ── 15. Floating-point tolerance: payment ≤ 0.01 above remaining allowed ──
  it("floating-point tolerance: ≤ 0.01 overage is accepted (not a real overpayment)", async () => {
    // Bill: 1000 total, 0 paid. Pay 1000.005 — within the 0.01 tolerance.
    configureSuccessfulClient(inrBill(1000, 0));
    mockRecompute.mockResolvedValue(recomputeResult(1000, 1000));

    const res = await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({
        payment_amount: "1000.005",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(res.status).toBe(200);
  });

  // ── 16. TOCTOU race safety: FOR UPDATE lock precedes the balance check ────
  //
  // Scenario: two requests arrive simultaneously for the same bill. Each reads
  // the pending balance independently and both appear to pass the overpayment
  // check — a classic Time-Of-Check / Time-Of-Use (TOCTOU) race that could
  // result in the bill being overpaid.
  //
  // Why this is safe in practice:
  //   The route opens a transaction (BEGIN) and immediately executes
  //     SELECT * FROM vendor_invoice_ledger WHERE id = $1 FOR UPDATE
  //   `FOR UPDATE` places an exclusive row-level lock on the bill record for
  //   the duration of the transaction. PostgreSQL serializes concurrent
  //   requests: the second caller blocks on the SELECT until the first
  //   transaction COMMITs or ROLLBACKs, at which point it re-reads the
  //   freshly updated paid_amount. The balance comparison is therefore always
  //   performed against committed, up-to-date data — there is no window in
  //   which both requests can simultaneously observe the pre-payment balance.
  //
  // This test verifies the structural guarantee: the `FOR UPDATE` clause is
  // emitted by the route *before* the INSERT (i.e. before any state mutation),
  // so the lock is always held across the full check-then-act sequence.
  //
  it("FOR UPDATE lock is issued before the balance check and INSERT (TOCTOU guard)", async () => {
    configureSuccessfulClient(inrBill(1000, 0));
    mockRecompute.mockResolvedValue(recomputeResult(1000, 500));

    await request(makeApp())
      .post("/vendor-bills/1/payment")
      .send({
        payment_amount: "500",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    // Extract the SQL strings from every client.query() call.
    const sqls: string[] = mockClientQuery.mock.calls.map(
      (args: unknown[]) => String(args[0])
    );

    const selectIdx  = sqls.findIndex((s) => /FOR UPDATE/i.test(s));
    const insertIdx  = sqls.findIndex((s) => /INSERT/i.test(s));
    const commitIdx  = sqls.findIndex((s) => /COMMIT/i.test(s));

    // The SELECT … FOR UPDATE must be present.
    expect(selectIdx).toBeGreaterThanOrEqual(0);

    // The lock must be acquired before the INSERT (balance check precedes write).
    expect(selectIdx).toBeLessThan(insertIdx);

    // And the INSERT must be before the COMMIT (write is inside the transaction).
    expect(insertIdx).toBeLessThan(commitIdx);
  });
});
