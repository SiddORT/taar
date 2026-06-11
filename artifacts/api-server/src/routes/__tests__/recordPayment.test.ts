/**
 * API-level tests for POST /account-sales/record-payment
 *
 * All external dependencies (DB pool, auth, recomputeInvoiceBalances) are
 * mocked so no real database is touched. Tests focus on the HTTP →
 * business-logic bridge: status codes, recompute triggers, and
 * connection-leak prevention.
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
// pool.connect() returns a lightweight client stub.
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

// Spy on recomputeInvoiceBalances so we can assert it was (or was not) called.
vi.mock("../../lib/invoiceBalances", () => ({
  recomputeInvoiceBalances: mockRecompute,
}));

// Import router AFTER mocks are declared (vitest hoists vi.mock calls above imports).
import accountSalesRouter from "../accountSales";

// ---------------------------------------------------------------------------
// Helper: build a minimal Express test app
// ---------------------------------------------------------------------------
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(accountSalesRouter);
  return app;
}

// ---------------------------------------------------------------------------
// Helper: build a valid invoice payment body
// ---------------------------------------------------------------------------
function validInvoicePayload(overrides: Record<string, unknown> = {}) {
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
  return {
    source_id: "inv-42",
    ref_type: "Invoice",
    client_name: "Test Client",
    client_id: 1,
    payment_amount: 1000,
    payment_type: "Bank Transfer",
    transaction_id: "TXN-001",
    payment_date: yesterday,
    currency_code: "INR",
    exchange_rate_snapshot: "1",
    remarks: "Test payment",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Default client-query behaviour for the happy path (invoice payment):
//   call 0 → BEGIN
//   call 1 → SELECT pending_amount (invoice found, pending = 5000)
//   call 2 → INSERT INTO invoice_payments
//   call 3 → INSERT INTO client_invoice_ledger
//   call 4 → COMMIT
// recomputeInvoiceBalances is mocked at the module level and does NOT add
// extra client.query calls in these tests.
// Override per-test via mockClientQuery.mockResolvedValueOnce.
// ---------------------------------------------------------------------------
function configureInvoiceFound() {
  mockClientQuery
    .mockResolvedValueOnce({ rows: [] })                                                           // BEGIN
    .mockResolvedValueOnce({ rows: [{ pending_amount: "5000", exchange_rate_snapshot: "1" }] })   // SELECT invoices
    .mockResolvedValueOnce({ rows: [] })                                                           // INSERT invoice_payments
    .mockResolvedValueOnce({ rows: [] })                                                           // INSERT client_invoice_ledger
    .mockResolvedValueOnce({ rows: [] });                                                          // COMMIT
}

beforeEach(() => {
  vi.clearAllMocks();
  mockConnect.mockResolvedValue({
    query: mockClientQuery,
    release: mockRelease,
  });
  mockRecompute.mockResolvedValue({
    totalAmount: 5000,
    receivedAmount: 1000,
    pendingAmount: 4000,
    status: "Partially Paid",
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("POST /record-payment", () => {

  // ── 1. Future payment date → 400 ─────────────────────────────────────────
  it("rejects a future payment date with 400", async () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split("T")[0];

    const res = await request(makeApp())
      .post("/record-payment")
      .send(validInvoicePayload({ payment_date: tomorrow }));

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "Payment date cannot be in the future" });
    expect(mockClientQuery).not.toHaveBeenCalled();
    expect(mockRecompute).not.toHaveBeenCalled();
  });

  // ── 2. Zero amount → 400 ──────────────────────────────────────────────────
  it("rejects a zero payment amount with 400", async () => {
    const res = await request(makeApp())
      .post("/record-payment")
      .send(validInvoicePayload({ payment_amount: 0 }));

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "Invalid payment amount" });
    expect(mockClientQuery).not.toHaveBeenCalled();
    expect(mockRecompute).not.toHaveBeenCalled();
  });

  // ── 3. Negative amount → 400 ──────────────────────────────────────────────
  it("rejects a negative payment amount with 400", async () => {
    const res = await request(makeApp())
      .post("/record-payment")
      .send(validInvoicePayload({ payment_amount: -100 }));

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "Invalid payment amount" });
    expect(mockClientQuery).not.toHaveBeenCalled();
  });

  // ── 4. Non-numeric / NaN amount → 400 ────────────────────────────────────
  it("rejects a non-numeric payment amount with 400", async () => {
    const res = await request(makeApp())
      .post("/record-payment")
      .send(validInvoicePayload({ payment_amount: "abc" }));

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "Invalid payment amount" });
    expect(mockClientQuery).not.toHaveBeenCalled();
  });

  // ── 5. Valid invoice payment: records and calls recomputeInvoiceBalances ──
  it("inserts the payment and calls recomputeInvoiceBalances for a valid invoice", async () => {
    configureInvoiceFound();

    const res = await request(makeApp())
      .post("/record-payment")
      .send(validInvoicePayload());

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
    expect(mockRecompute).toHaveBeenCalledOnce();
    expect(mockRecompute).toHaveBeenCalledWith(
      expect.objectContaining({ query: mockClientQuery }),
      42, // invoice id parsed from "inv-42"
    );
  });

  // ── 6. Invoice not found → 404 ────────────────────────────────────────────
  it("returns 404 when the referenced invoice is not found", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })   // BEGIN
      .mockResolvedValueOnce({ rows: [] })   // SELECT invoices → not found
      .mockResolvedValueOnce({ rows: [] });  // ROLLBACK

    const res = await request(makeApp())
      .post("/record-payment")
      .send(validInvoicePayload());

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: "Invoice not found" });
    expect(mockRecompute).not.toHaveBeenCalled();
  });

  // ── 7. Connection always released on success ──────────────────────────────
  it("releases the pool client after a successful payment", async () => {
    configureInvoiceFound();

    await request(makeApp())
      .post("/record-payment")
      .send(validInvoicePayload());

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 8. Connection released even when amount is invalid (early return) ─────
  it("releases the pool client even when amount validation fails", async () => {
    await request(makeApp())
      .post("/record-payment")
      .send(validInvoicePayload({ payment_amount: 0 }));

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 9. Connection released even when date validation fails (early return) ─
  it("releases the pool client even when date validation fails", async () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split("T")[0];

    await request(makeApp())
      .post("/record-payment")
      .send(validInvoicePayload({ payment_date: tomorrow }));

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 10. Connection released on 404 (invoice not found) ───────────────────
  it("releases the pool client even when invoice is not found", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })   // BEGIN
      .mockResolvedValueOnce({ rows: [] })   // SELECT → not found
      .mockResolvedValueOnce({ rows: [] });  // ROLLBACK

    await request(makeApp())
      .post("/record-payment")
      .send(validInvoicePayload());

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 11. DB error → 500, ROLLBACK issued, connection released ─────────────
  it("returns 500 and issues ROLLBACK when a DB error occurs, then releases the connection", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [] })         // BEGIN
      .mockRejectedValueOnce(new Error("DB fail")) // SELECT invoices throws
      .mockResolvedValueOnce({ rows: [] });         // ROLLBACK

    const res = await request(makeApp())
      .post("/record-payment")
      .send(validInvoicePayload());

    expect(res.status).toBe(500);
    const calls = mockClientQuery.mock.calls.map((c: unknown[][]) => String(c[0]));
    expect(calls.some((sql: string) => sql.includes("ROLLBACK"))).toBe(true);
    expect(mockRelease).toHaveBeenCalledOnce();
  });
});
