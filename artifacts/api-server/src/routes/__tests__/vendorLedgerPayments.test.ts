/**
 * API-level tests for DELETE /vendor-ledger/payments/:id
 *
 * These tests mount the vendorLedger router on a test Express app with all
 * external dependencies (DB pool, auth, recomputeVendorBillBalances) mocked,
 * so the DB is never touched and the test focus is on the HTTP → business-logic
 * bridge: status codes, recompute triggers, and bill-status revert behaviour.
 */
import { vi, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// ---------------------------------------------------------------------------
// Hoisted mocks — vi.hoisted() runs before imports, so the mock factories
// below can safely close over these refs.
// ---------------------------------------------------------------------------
const { mockClientQuery, mockRelease, mockConnect, mockRecompute } = vi.hoisted(() => ({
  mockClientQuery: vi.fn(),
  mockRelease: vi.fn(),
  mockConnect: vi.fn(),
  mockRecompute: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock @workspace/db
// Pool.connect() returns a lightweight client stub; db/tables are stubs only
// since the DELETE /payments/:id route uses pool, not drizzle.
// ---------------------------------------------------------------------------
vi.mock("@workspace/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
  pool: { connect: mockConnect, query: vi.fn() },
  vendorPaymentsTable: Symbol("vendorPaymentsTable"),
  vendorLedgerChargesTable: Symbol("vendorLedgerChargesTable"),
  vendorsTable: Symbol("vendorsTable"),
  insertVendorPaymentSchema: { safeParse: vi.fn(() => ({ success: false })) },
  insertVendorLedgerChargeSchema: { safeParse: vi.fn(() => ({ success: false })) },
  eq: vi.fn(),
  and: vi.fn(),
}));

// Bypass JWT auth — sets req.user so downstream code can read .email
vi.mock("../../middlewares/requireAuth", () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.user = { userId: 1, email: "tester@example.com", role: "admin" };
    next();
  },
}));

// Spy on recomputeVendorBillBalances so we can assert it was called correctly.
vi.mock("../../lib/vendorBillBalances", () => ({
  recomputeVendorBillBalances: mockRecompute,
}));

// Import router AFTER mocks are declared (vitest hoists vi.mock calls above imports).
import vendorLedgerRouter from "../vendorLedger";

// ---------------------------------------------------------------------------
// Helper: build a minimal Express test app
// ---------------------------------------------------------------------------
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(vendorLedgerRouter);
  return app;
}

// ---------------------------------------------------------------------------
// Default client-query behaviour:
//   call 0 → BEGIN (no return value needed)
//   call 1 → UPDATE vendor_payments RETURNING vendor_invoice_ledger_id
//   call 2 → COMMIT (no return value needed)
// Override per-test via mockClientQuery.mockImplementation or mockResolvedValueOnce.
// ---------------------------------------------------------------------------
function configureClient(billId: number | null) {
  mockClientQuery
    .mockResolvedValueOnce({ rows: [] })                        // BEGIN
    .mockResolvedValueOnce({ rows: [{ vendor_invoice_ledger_id: billId }] }) // UPDATE
    .mockResolvedValueOnce({ rows: [] });                       // COMMIT
}

beforeEach(() => {
  vi.clearAllMocks();
  mockConnect.mockResolvedValue({
    query: mockClientQuery,
    release: mockRelease,
  });
  mockRecompute.mockResolvedValue({
    totalAmount: 1000,
    paidAmount: 600,
    pendingAmount: 400,
    status: "Partially Paid",
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("DELETE /vendor-ledger/payments/:id", () => {

  // ── 1. Payment linked to a bill: recompute is called ─────────────────────
  it("calls recomputeVendorBillBalances with the linked bill ID and returns success", async () => {
    const billId = 42;
    configureClient(billId);

    const res = await request(makeApp()).delete("/vendor-ledger/payments/7");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(mockRecompute).toHaveBeenCalledOnce();
    expect(mockRecompute).toHaveBeenCalledWith(
      expect.objectContaining({ query: mockClientQuery }),
      billId,
    );
  });

  // ── 2. Payment NOT linked to a bill: recompute is skipped ────────────────
  it("does NOT call recomputeVendorBillBalances when vendor_invoice_ledger_id is null", async () => {
    configureClient(null);

    const res = await request(makeApp()).delete("/vendor-ledger/payments/8");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(mockRecompute).not.toHaveBeenCalled();
  });

  // ── 3. Payment not found (already deleted or wrong ID) → 404 ─────────────
  it("returns 404 when the payment row is not found", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })   // BEGIN
      .mockResolvedValueOnce({ rows: [] })   // UPDATE → nothing matched
      .mockResolvedValueOnce({ rows: [] });  // ROLLBACK

    const res = await request(makeApp()).delete("/vendor-ledger/payments/999");

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: "Not found" });
    expect(mockRecompute).not.toHaveBeenCalled();
  });

  // ── 4. Pool client is always released (no connection leak) ───────────────
  it("releases the pool client regardless of outcome", async () => {
    configureClient(10);

    await request(makeApp()).delete("/vendor-ledger/payments/1");

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  it("releases the pool client even on 404", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })  // BEGIN
      .mockResolvedValueOnce({ rows: [] })  // UPDATE → not found
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    await request(makeApp()).delete("/vendor-ledger/payments/999");

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 5. Bill-status revert: verify recompute receives the right bill ID ────
  // This exercises the "Paid → Partially Paid" scenario at the API layer:
  // the recompute mock returns a Partially Paid result, confirming the
  // endpoint correctly threads the client + billId to the recompute function.
  it("bill-status revert: recompute mock returning Partially Paid is propagated correctly", async () => {
    const billId = 77;
    configureClient(billId);
    mockRecompute.mockResolvedValueOnce({
      totalAmount: 2000,
      paidAmount: 1000,
      pendingAmount: 1000,
      status: "Partially Paid",
    });

    const res = await request(makeApp()).delete("/vendor-ledger/payments/5");

    expect(res.status).toBe(200);
    expect(mockRecompute).toHaveBeenCalledWith(
      expect.objectContaining({ query: mockClientQuery }),
      billId,
    );
  });

  // ── 6. DB error → 500 and ROLLBACK ───────────────────────────────────────
  it("returns 500 and issues ROLLBACK when a DB error occurs", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })       // BEGIN
      .mockRejectedValueOnce(new Error("DB fail")) // UPDATE throws
      .mockResolvedValueOnce({ rows: [] });       // ROLLBACK

    const res = await request(makeApp()).delete("/vendor-ledger/payments/3");

    expect(res.status).toBe(500);
    // Third call should be ROLLBACK
    const calls = mockClientQuery.mock.calls.map((c: string[][]) => String(c[0]));
    expect(calls.some((sql: string) => sql.includes("ROLLBACK"))).toBe(true);
    expect(mockRelease).toHaveBeenCalledOnce();
  });
});
