/**
 * API-level tests for DELETE /invoice-payments/:id
 *
 * These tests mount the invoicePayments router on a test Express app with all
 * external dependencies (DB pool, auth, recomputeInvoiceBalances) mocked,
 * so the DB is never touched and the test focus is on the HTTP → business-logic
 * bridge: status codes, recompute triggers, and connection-leak prevention.
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
// Pool.connect() returns a lightweight client stub; the DELETE route uses
// the raw pool client (not drizzle), so only pool.connect is needed here.
// ---------------------------------------------------------------------------
vi.mock("@workspace/db", () => ({
  pool: { connect: mockConnect, query: vi.fn() },
}));

// Bypass JWT auth — sets req.user so downstream code can read .email
vi.mock("../../middlewares/requireAuth", () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { user: unknown }).user = { email: "tester@example.com" };
    next();
  },
}));

// Spy on recomputeInvoiceBalances so we can assert it was called correctly.
vi.mock("../../lib/invoiceBalances", () => ({
  recomputeInvoiceBalances: mockRecompute,
}));

// Import router AFTER mocks are declared (vitest hoists vi.mock calls above imports).
import invoicePaymentsRouter from "../invoicePayments";

// ---------------------------------------------------------------------------
// Helper: build a minimal Express test app
// ---------------------------------------------------------------------------
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(invoicePaymentsRouter);
  return app;
}

// ---------------------------------------------------------------------------
// Default client-query behaviour for the happy path:
//   call 0 → BEGIN
//   call 1 → SELECT invoice_payments (payment found)
//   call 2 → UPDATE invoice_payments (soft delete)
//   call 3 → COMMIT
// recomputeInvoiceBalances is mocked at the module level and does NOT add
// extra client.query calls in these tests.
// Override per-test via mockClientQuery.mockResolvedValueOnce.
// ---------------------------------------------------------------------------
function configureClientFound(invoiceId: number) {
  mockClientQuery
    .mockResolvedValueOnce({ rows: [] })                                                   // BEGIN
    .mockResolvedValueOnce({ rows: [{ payment_id: 7, invoice_id: invoiceId }] })           // SELECT
    .mockResolvedValueOnce({ rows: [] })                                                   // UPDATE
    .mockResolvedValueOnce({ rows: [] });                                                  // COMMIT
}

beforeEach(() => {
  vi.clearAllMocks();
  mockConnect.mockResolvedValue({
    query: mockClientQuery,
    release: mockRelease,
  });
  mockRecompute.mockResolvedValue({
    totalAmount: 5000,
    receivedAmount: 3000,
    pendingAmount: 2000,
    status: "Partially Paid",
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("DELETE /invoice-payments/:id", () => {

  // ── 1. Payment found: recompute is called, success is returned ────────────
  it("calls recomputeInvoiceBalances with the linked invoice ID and returns success", async () => {
    const invoiceId = 42;
    configureClientFound(invoiceId);

    const res = await request(makeApp()).delete("/invoice-payments/7");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockRecompute).toHaveBeenCalledOnce();
    expect(mockRecompute).toHaveBeenCalledWith(
      expect.objectContaining({ query: mockClientQuery }),
      invoiceId,
    );
  });

  // ── 2. Response carries recomputed balance fields ─────────────────────────
  it("response body includes invoice_status, received_amount, pending_amount from recompute", async () => {
    const invoiceId = 55;
    configureClientFound(invoiceId);
    mockRecompute.mockResolvedValueOnce({
      totalAmount: 1000,
      receivedAmount: 0,
      pendingAmount: 1000,
      status: "Generated",
    });

    const res = await request(makeApp()).delete("/invoice-payments/7");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      invoice_status: "Generated",
      received_amount: 0,
      pending_amount: 1000,
    });
  });

  // ── 3. Payment not found (already deleted or wrong ID) → 404 ─────────────
  it("returns 404 when the payment row is not found", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })   // BEGIN
      .mockResolvedValueOnce({ rows: [] })   // SELECT → nothing matched
      .mockResolvedValueOnce({ rows: [] });  // ROLLBACK

    const res = await request(makeApp()).delete("/invoice-payments/999");

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: "Payment not found" });
    expect(mockRecompute).not.toHaveBeenCalled();
  });

  // ── 4. Invalid (non-numeric) id → 400 ────────────────────────────────────
  it("returns 400 for a non-numeric payment id", async () => {
    const res = await request(makeApp()).delete("/invoice-payments/abc");

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "Invalid id" });
    expect(mockConnect).not.toHaveBeenCalled();
  });

  // ── 5. Pool client is always released on success ──────────────────────────
  it("releases the pool client after a successful delete", async () => {
    configureClientFound(10);

    await request(makeApp()).delete("/invoice-payments/1");

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 6. Pool client is released even on 404 ───────────────────────────────
  it("releases the pool client even when payment is not found", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })  // BEGIN
      .mockResolvedValueOnce({ rows: [] })  // SELECT → not found
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    await request(makeApp()).delete("/invoice-payments/999");

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 7. DB error → 500 and ROLLBACK ───────────────────────────────────────
  it("returns 500 and issues ROLLBACK when a DB error occurs", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })          // BEGIN
      .mockRejectedValueOnce(new Error("DB fail"))   // SELECT throws
      .mockResolvedValueOnce({ rows: [] });          // ROLLBACK

    const res = await request(makeApp()).delete("/invoice-payments/3");

    expect(res.status).toBe(500);
    const calls = mockClientQuery.mock.calls.map((c: unknown[][]) => String(c[0]));
    expect(calls.some((sql: string) => sql.includes("ROLLBACK"))).toBe(true);
    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 8. Pool client released even when DB error occurs ────────────────────
  it("releases the pool client even on a DB error", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })          // BEGIN
      .mockRejectedValueOnce(new Error("timeout"))   // SELECT throws
      .mockResolvedValueOnce({ rows: [] });          // ROLLBACK

    await request(makeApp()).delete("/invoice-payments/5");

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 9. Invoice-status revert: recompute returning Paid is forwarded ───────
  // This exercises the "Partially Paid → Paid" / "Paid → Generated" revert
  // scenario at the API layer: recompute returns the new status and the
  // endpoint correctly threads it into the HTTP response.
  it("invoice-status revert: recompute mock returning Paid propagates correctly", async () => {
    const invoiceId = 77;
    configureClientFound(invoiceId);
    mockRecompute.mockResolvedValueOnce({
      totalAmount: 2000,
      receivedAmount: 2000,
      pendingAmount: 0,
      status: "Paid",
    });

    const res = await request(makeApp()).delete("/invoice-payments/5");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, invoice_status: "Paid" });
    expect(mockRecompute).toHaveBeenCalledWith(
      expect.objectContaining({ query: mockClientQuery }),
      invoiceId,
    );
  });
});
