/**
 * API-level tests for POST /account-purchases/record-payment
 * covering the Costing Outsource and Other Expense branches.
 *
 * All external dependencies (DB pool, auth, recomputeVendorBillBalances) are
 * mocked so no real database is touched. The primary focus is verifying that
 * both branches acquire a FOR UPDATE row-level lock *before* any state
 * mutation, mirroring the TOCTOU-guard test in vendorBillPayment.test.ts
 * (test #16).
 *
 * Why FOR UPDATE matters here:
 *   Without a lock, two simultaneous payment requests for the same
 *   outsource job or expense can both pass a balance check at the same
 *   time — a classic Time-Of-Check/Time-Of-Use (TOCTOU) race. The lock
 *   serializes concurrent transactions so the second caller always reads
 *   committed, up-to-date data before deciding whether to proceed.
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

// ─── Mock recomputeVendorBillBalances (used by Purchase Receipt branch only) ──
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

// ─── Row factories ────────────────────────────────────────────────────────────
function outsourceJobRow(id = 1, totalCost = "5000"): Record<string, string> {
  return {
    id: String(id),
    vendor_id: "10",
    vendor_name: "Test Vendor",
    total_cost: totalCost,
    is_deleted: "false",
  };
}

function otherExpenseRow(id = 1, amount = "2000", paidAmount = "0"): Record<string, string> {
  return {
    expense_id: String(id),
    vendor_id: "20",
    vendor_name: "Expense Vendor",
    amount,
    paid_amount: paidAmount,
    payment_status: paidAmount === "0" ? "Unpaid" : "Partially Paid",
  };
}

// ─── Default before-each ──────────────────────────────────────────────────────
beforeEach(() => {
  vi.resetAllMocks();
  mockConnect.mockResolvedValue({
    query: mockClientQuery,
    release: mockRelease,
  });
  mockRecompute.mockResolvedValue({});
});

// ═════════════════════════════════════════════════════════════════════════════
// Costing Outsource branch
// ═════════════════════════════════════════════════════════════════════════════
describe("POST /record-payment — Costing Outsource", () => {

  // ── 1. Happy path: payment recorded successfully ──────────────────────────
  it("records a payment for a valid outsource job and returns success", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })                            // BEGIN
      .mockResolvedValueOnce({ rows: [outsourceJobRow()] })          // SELECT outsource_jobs FOR UPDATE
      .mockResolvedValueOnce({ rows: [] })                           // INSERT costing_payments
      .mockResolvedValueOnce({ rows: [] });                          // COMMIT

    const res = await request(makeApp())
      .post("/record-payment")
      .send({
        ref_type: "Costing Outsource",
        source_id: "1",
        vendor_id: 10,
        vendor_name: "Test Vendor",
        payment_amount: "1000",
        payment_date: "2026-06-01",
        payment_type: "Bank Transfer",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: "Vendor payment recorded successfully" });
  });

  // ── 2. Outsource job not found → 400 ─────────────────────────────────────
  it("returns 400 when the outsource job is not found", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })  // BEGIN
      .mockResolvedValueOnce({ rows: [] })  // SELECT outsource_jobs FOR UPDATE → not found
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    const res = await request(makeApp())
      .post("/record-payment")
      .send({
        ref_type: "Costing Outsource",
        source_id: "999",
        payment_amount: "500",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/outsource job not found/i);
  });

  // ── 3. Zero payment amount is rejected before any DB call ─────────────────
  it("rejects payment_amount = 0 with 400", async () => {
    mockClientQuery.mockResolvedValueOnce({ rows: [] }); // BEGIN

    const res = await request(makeApp())
      .post("/record-payment")
      .send({ ref_type: "Costing Outsource", source_id: "1", payment_amount: "0" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/must be > 0/i);
  });

  // ── 4. Pool client always released — success path ─────────────────────────
  it("releases the pool client on a successful payment", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [outsourceJobRow()] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await request(makeApp())
      .post("/record-payment")
      .send({
        ref_type: "Costing Outsource",
        source_id: "1",
        payment_amount: "500",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 5. Pool client always released — error path ───────────────────────────
  it("releases the pool client when payment is rejected", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })  // BEGIN
      .mockResolvedValueOnce({ rows: [] })  // SELECT → not found
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    await request(makeApp())
      .post("/record-payment")
      .send({
        ref_type: "Costing Outsource",
        source_id: "999",
        payment_amount: "500",
      });

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 6. TOCTOU race safety: FOR UPDATE lock precedes the INSERT ────────────
  //
  // Scenario: two requests arrive simultaneously for the same outsource job.
  // Without a lock both could proceed to INSERT — a TOCTOU race that allows
  // duplicate or over-payments.
  //
  // Why this is safe:
  //   The route opens a transaction (BEGIN) then immediately executes
  //     SELECT * FROM outsource_jobs WHERE id = $1 … FOR UPDATE
  //   This places an exclusive row-level lock for the duration of the
  //   transaction. The second concurrent caller blocks on the SELECT until
  //   the first COMMITs or ROLLBACKs, so it always sees committed data.
  //
  // This test verifies the structural guarantee: the FOR UPDATE clause is
  // emitted before the INSERT, ensuring the lock spans the full
  // check-then-act sequence.
  //
  it("FOR UPDATE lock on outsource_jobs is issued before the INSERT (TOCTOU guard)", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })                   // BEGIN
      .mockResolvedValueOnce({ rows: [outsourceJobRow()] }) // SELECT … FOR UPDATE
      .mockResolvedValueOnce({ rows: [] })                   // INSERT costing_payments
      .mockResolvedValueOnce({ rows: [] });                  // COMMIT

    await request(makeApp())
      .post("/record-payment")
      .send({
        ref_type: "Costing Outsource",
        source_id: "1",
        vendor_id: 10,
        vendor_name: "Test Vendor",
        payment_amount: "500",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    const sqls: string[] = mockClientQuery.mock.calls.map(
      (args: unknown[]) => String(args[0])
    );

    const selectIdx = sqls.findIndex((s) => /FOR UPDATE/i.test(s));
    const insertIdx = sqls.findIndex((s) => /INSERT/i.test(s));
    const commitIdx = sqls.findIndex((s) => /COMMIT/i.test(s));

    // The SELECT … FOR UPDATE must be present.
    expect(selectIdx).toBeGreaterThanOrEqual(0);

    // The FOR UPDATE query must target outsource_jobs.
    expect(sqls[selectIdx]).toMatch(/outsource_jobs/i);

    // Lock must be acquired before the INSERT (check precedes write).
    expect(selectIdx).toBeLessThan(insertIdx);

    // The INSERT must be inside the transaction (before COMMIT).
    expect(insertIdx).toBeLessThan(commitIdx);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Other Expense branch
// ═════════════════════════════════════════════════════════════════════════════
describe("POST /record-payment — Other Expense", () => {

  // ── 1. Happy path: payment recorded successfully ──────────────────────────
  it("records a payment for a valid expense and returns success", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })                            // BEGIN
      .mockResolvedValueOnce({ rows: [otherExpenseRow()] })          // SELECT other_expenses FOR UPDATE
      .mockResolvedValueOnce({ rows: [] })                           // UPDATE other_expenses
      .mockResolvedValueOnce({ rows: [] })                           // INSERT vendor_payments
      .mockResolvedValueOnce({ rows: [] });                          // COMMIT

    const res = await request(makeApp())
      .post("/record-payment")
      .send({
        ref_type: "Other Expense",
        source_id: "1",
        vendor_id: 20,
        vendor_name: "Expense Vendor",
        payment_amount: "500",
        payment_date: "2026-06-01",
        payment_type: "Bank Transfer",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ message: "Vendor payment recorded successfully" });
  });

  // ── 2. Expense not found → 400 ────────────────────────────────────────────
  it("returns 400 when the expense record is not found", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })  // BEGIN
      .mockResolvedValueOnce({ rows: [] })  // SELECT other_expenses FOR UPDATE → not found
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    const res = await request(makeApp())
      .post("/record-payment")
      .send({
        ref_type: "Other Expense",
        source_id: "999",
        payment_amount: "500",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/expense not found/i);
  });

  // ── 3. Zero payment amount is rejected ────────────────────────────────────
  it("rejects payment_amount = 0 with 400", async () => {
    mockClientQuery.mockResolvedValueOnce({ rows: [] }); // BEGIN

    const res = await request(makeApp())
      .post("/record-payment")
      .send({ ref_type: "Other Expense", source_id: "1", payment_amount: "0" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/must be > 0/i);
  });

  // ── 4. Partial payment updates status to Partially Paid ───────────────────
  it("partial payment sets status to Partially Paid", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [otherExpenseRow(1, "2000", "0")] })
      .mockResolvedValueOnce({ rows: [] }) // UPDATE other_expenses
      .mockResolvedValueOnce({ rows: [] }) // INSERT vendor_payments
      .mockResolvedValueOnce({ rows: [] }); // COMMIT

    const res = await request(makeApp())
      .post("/record-payment")
      .send({
        ref_type: "Other Expense",
        source_id: "1",
        payment_amount: "1000",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(res.status).toBe(200);

    const updateCall = mockClientQuery.mock.calls.find(
      (args: unknown[]) => /UPDATE other_expenses/i.test(String(args[0]))
    );
    expect(updateCall).toBeDefined();
    // Second param is new paid_amount (1000), third is status
    expect(updateCall![1]).toContain("Partially Paid");
  });

  // ── 5. Full payment sets status to Paid ───────────────────────────────────
  it("full payment sets status to Paid", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [otherExpenseRow(1, "2000", "0")] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(makeApp())
      .post("/record-payment")
      .send({
        ref_type: "Other Expense",
        source_id: "1",
        payment_amount: "2000",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(res.status).toBe(200);

    const updateCall = mockClientQuery.mock.calls.find(
      (args: unknown[]) => /UPDATE other_expenses/i.test(String(args[0]))
    );
    expect(updateCall).toBeDefined();
    expect(updateCall![1]).toContain("Paid");
  });

  // ── 6. Pool client always released — success path ─────────────────────────
  it("releases the pool client on a successful payment", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [otherExpenseRow()] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await request(makeApp())
      .post("/record-payment")
      .send({
        ref_type: "Other Expense",
        source_id: "1",
        payment_amount: "500",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 7. Pool client always released — error path ───────────────────────────
  it("releases the pool client when payment is rejected", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await request(makeApp())
      .post("/record-payment")
      .send({
        ref_type: "Other Expense",
        source_id: "999",
        payment_amount: "500",
      });

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 8. TOCTOU race safety: FOR UPDATE lock precedes the UPDATE ────────────
  //
  // Scenario: two requests arrive simultaneously for the same expense record.
  // Without a lock both would read the same paid_amount and both compute
  // newPaid = oldPaid + amt, resulting in the second write silently
  // discarding the first payment — a TOCTOU race.
  //
  // Why this is safe:
  //   The route opens a transaction (BEGIN) then executes
  //     SELECT * FROM other_expenses WHERE expense_id = $1 FOR UPDATE
  //   The exclusive row lock forces the second concurrent caller to wait
  //   until the first COMMITs, so it always reads the up-to-date paid_amount.
  //
  // This test verifies the structural guarantee: the FOR UPDATE clause is
  // emitted before the UPDATE, ensuring the lock spans the full
  // read-then-write sequence.
  //
  it("FOR UPDATE lock on other_expenses is issued before the UPDATE (TOCTOU guard)", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })                     // BEGIN
      .mockResolvedValueOnce({ rows: [otherExpenseRow()] })   // SELECT … FOR UPDATE
      .mockResolvedValueOnce({ rows: [] })                     // UPDATE other_expenses
      .mockResolvedValueOnce({ rows: [] })                     // INSERT vendor_payments
      .mockResolvedValueOnce({ rows: [] });                    // COMMIT

    await request(makeApp())
      .post("/record-payment")
      .send({
        ref_type: "Other Expense",
        source_id: "1",
        vendor_id: 20,
        vendor_name: "Expense Vendor",
        payment_amount: "500",
        currency_code: "INR",
        exchange_rate_snapshot: "1",
      });

    const sqls: string[] = mockClientQuery.mock.calls.map(
      (args: unknown[]) => String(args[0])
    );

    const selectIdx = sqls.findIndex((s) => /FOR UPDATE/i.test(s));
    const updateIdx = sqls.findIndex((s) => /UPDATE other_expenses/i.test(s));
    const commitIdx = sqls.findIndex((s) => /COMMIT/i.test(s));

    // The SELECT … FOR UPDATE must be present.
    expect(selectIdx).toBeGreaterThanOrEqual(0);

    // The FOR UPDATE query must target other_expenses.
    expect(sqls[selectIdx]).toMatch(/other_expenses/i);

    // Lock must be acquired before the UPDATE (read precedes write).
    expect(selectIdx).toBeLessThan(updateIdx);

    // The UPDATE must be inside the transaction (before COMMIT).
    expect(updateIdx).toBeLessThan(commitIdx);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Purchase Receipt branch — status guard (Cancelled / Paid)
// ═════════════════════════════════════════════════════════════════════════════
describe("POST /record-payment — Purchase Receipt status guard", () => {

  function prBillRow(status: string): Record<string, string> {
    return {
      id: "1",
      vendor_id: "10",
      vendor_name: "Test Vendor",
      vendor_invoice_amount: "5000",
      paid_amount: status === "Paid" ? "5000" : "0",
      exchange_rate_snapshot: "1",
      currency_code: "INR",
      status,
    };
  }

  const validPayload = {
    ref_type: "Purchase Receipt",
    source_id: "1",
    vendor_id: 10,
    vendor_name: "Test Vendor",
    payment_amount: "500",
    payment_date: "2026-06-01",
    payment_type: "Bank Transfer",
    currency_code: "INR",
    exchange_rate_snapshot: "1",
  };

  // ── 1. Cancelled bill → 400 with descriptive error ────────────────────────
  it("returns 400 with descriptive error when the bill is Cancelled", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })                         // BEGIN
      .mockResolvedValueOnce({ rows: [prBillRow("Cancelled")] })  // SELECT … FOR UPDATE
      .mockResolvedValueOnce({ rows: [] });                        // ROLLBACK

    const res = await request(makeApp())
      .post("/record-payment")
      .send(validPayload);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cancelled/i);
    // Payment INSERT must NOT have been attempted
    const sqls: string[] = mockClientQuery.mock.calls.map((args: unknown[]) => String(args[0]));
    expect(sqls.some((s) => /INSERT/i.test(s))).toBe(false);
  });

  // ── 2. Paid bill → 400 with descriptive error ─────────────────────────────
  it("returns 400 with descriptive error when the bill is already Paid", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })                     // BEGIN
      .mockResolvedValueOnce({ rows: [prBillRow("Paid")] })   // SELECT … FOR UPDATE
      .mockResolvedValueOnce({ rows: [] });                    // ROLLBACK

    const res = await request(makeApp())
      .post("/record-payment")
      .send(validPayload);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/paid/i);
    // Payment INSERT must NOT have been attempted
    const sqls: string[] = mockClientQuery.mock.calls.map((args: unknown[]) => String(args[0]));
    expect(sqls.some((s) => /INSERT/i.test(s))).toBe(false);
  });

  // ── 3. Pool client is released even when the guard rejects ────────────────
  it("releases the pool client when the Cancelled guard fires", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [prBillRow("Cancelled")] })
      .mockResolvedValueOnce({ rows: [] });

    await request(makeApp()).post("/record-payment").send(validPayload);

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 4. Bill not found → 400 ───────────────────────────────────────────────
  it("returns 400 when the bill is not found", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })  // BEGIN
      .mockResolvedValueOnce({ rows: [] })  // SELECT → not found
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    const res = await request(makeApp())
      .post("/record-payment")
      .send(validPayload);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/bill not found/i);
  });
});
