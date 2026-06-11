/**
 * API-level tests for POST /purchase-receipts/:id/confirm
 *
 * These tests mount the purchaseReceipts router on a minimal Express app with
 * all external dependencies (DB pool, auth, sequence utils) mocked so the DB is
 * never touched. The focus is on:
 *  - Correct weighted-average price passed to the UPDATE (uses computeNewAveragePrice)
 *  - Correct available-stock calculation (uses computeAvailableStock)
 *  - Status guard: already-confirmed → 422, not-found → 404
 *  - Transaction sequencing: COMMIT on success, ROLLBACK on error
 *  - Pool client always released
 */
import { vi, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────
const { mockClientQuery, mockRelease, mockConnect } = vi.hoisted(() => ({
  mockClientQuery: vi.fn(),
  mockRelease: vi.fn(),
  mockConnect: vi.fn(),
}));

// ─── Mock @workspace/db ────────────────────────────────────────────────────────
vi.mock("@workspace/db", () => ({
  pool: { connect: mockConnect, query: vi.fn() },
}));

// ─── Bypass JWT auth ───────────────────────────────────────────────────────────
vi.mock("../../middlewares/requireAuth", () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { user: unknown }).user = { email: "tester@example.com", name: "Tester" };
    next();
  },
}));

// ─── Stub sequence util so generatePrNumber never hits the DB ─────────────────
vi.mock("../../utils/sequence", () => ({
  nextSequenceNumber: vi.fn().mockResolvedValue(1),
}));

import purchaseReceiptsRouter from "../purchaseReceipts";

// ─── Test app factory ──────────────────────────────────────────────────────────
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(purchaseReceiptsRouter);
  return app;
}

// ─── DB response helpers ───────────────────────────────────────────────────────

function prRow(status = "draft") {
  return { id: 1, pr_number: "PR-20260601-0001", status, vendor_id: null, vendor_name: "Test Vendor", is_deleted: false };
}

function itemRow(opts: { invId?: number; qty?: string; price?: string; warehouseLocation?: string; remarks?: string } = {}) {
  return {
    inventory_item_id: opts.invId ?? 10,
    qty: opts.qty ?? "50.000",
    price: opts.price ?? "100.00",
    warehouse_location: opts.warehouseLocation ?? null,
    remarks: opts.remarks ?? null,
  };
}

function inventoryRow(opts: { currentStock?: string; avgPrice?: string; styleRes?: string; swatchRes?: string } = {}) {
  return {
    id: 10,
    item_name: "Test Fabric",
    item_code: "FAB-001",
    current_stock: opts.currentStock ?? "100.000",
    average_price: opts.avgPrice ?? "80.00",
    style_reserved_qty: opts.styleRes ?? "0",
    swatch_reserved_qty: opts.swatchRes ?? "0",
  };
}

/**
 * Build the mock call sequence for a successful confirm of a single-item PR.
 *
 * call 0  → BEGIN
 * call 1  → SELECT inv_receipts (returns PR row)
 * call 2  → SELECT inv_receipt_items (returns items array)
 * -- applyInventoryUpdate per item: --
 * call 3  → SELECT inventory_items (returns inventory row)
 * call 4  → UPDATE inventory_items
 * call 5  → INSERT stock_ledger
 * call 6  → INSERT inventory_stock_logs (non-fatal, returns success)
 * -- back in confirm handler: --
 * call 7  → UPDATE inv_receipts SET status = 'confirmed'
 * call 8  → COMMIT
 */
function configureSuccessfulConfirm(
  prStatus = "draft",
  invOpts: Parameters<typeof inventoryRow>[0] = {},
  itemOpts: Parameters<typeof itemRow>[0] = {},
) {
  mockClientQuery
    .mockResolvedValueOnce({ rows: [prRow(prStatus)] })      // SELECT inv_receipts
    .mockResolvedValueOnce({ rows: [itemRow(itemOpts)] })    // SELECT inv_receipt_items
    .mockResolvedValueOnce({ rows: [inventoryRow(invOpts)] }) // SELECT inventory_items
    .mockResolvedValueOnce({ rows: [] })                     // UPDATE inventory_items
    .mockResolvedValueOnce({ rows: [] })                     // INSERT stock_ledger
    .mockResolvedValueOnce({ rows: [] })                     // INSERT inventory_stock_logs
    .mockResolvedValueOnce({ rows: [] })                     // UPDATE inv_receipts status
    .mockResolvedValueOnce({ rows: [] });                    // COMMIT
}

// ─── Default before-each ───────────────────────────────────────────────────────
beforeEach(() => {
  vi.resetAllMocks();
  mockConnect.mockResolvedValue({
    query: mockClientQuery,
    release: mockRelease,
  });
  // BEGIN is always the first call in the confirm handler
  mockClientQuery.mockResolvedValueOnce({ rows: [] }); // BEGIN
});

// ─── Tests ─────────────────────────────────────────────────────────────────────
describe("POST /purchase-receipts/:id/confirm", () => {

  // ── 1. Happy path: confirms a draft PR ───────────────────────────────────────
  it("returns 200 and confirms a draft PR", async () => {
    configureSuccessfulConfirm();

    const res = await request(makeApp()).post("/purchase-receipts/1/confirm");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/confirmed/i);
  });

  // ── 2. Already-confirmed PR → 422 ────────────────────────────────────────────
  it("returns 422 when the PR is already confirmed", async () => {
    mockClientQuery.mockResolvedValueOnce({ rows: [prRow("confirmed")] }); // SELECT inv_receipts

    const res = await request(makeApp()).post("/purchase-receipts/1/confirm");

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/already confirmed/i);
  });

  // ── 3. PR not found → 404 ────────────────────────────────────────────────────
  it("returns 404 when the PR does not exist", async () => {
    mockClientQuery.mockResolvedValueOnce({ rows: [] }); // SELECT → not found

    const res = await request(makeApp()).post("/purchase-receipts/999/confirm");

    expect(res.status).toBe(404);
  });

  // ── 4. Weighted-average price is computed correctly ──────────────────────────
  // Existing stock: 100 units @ ₹80 avg. Receiving 50 units @ ₹100.
  // New avg = (100×80 + 50×100) / 150 = (8000+5000)/150 = 13000/150 ≈ 86.67
  it("writes the correct weighted-average price to inventory_items", async () => {
    configureSuccessfulConfirm(
      "draft",
      { currentStock: "100.000", avgPrice: "80.00" }, // existing inventory
      { qty: "50.000", price: "100.00" },              // incoming receipt item
    );

    await request(makeApp()).post("/purchase-receipts/1/confirm");

    // The UPDATE inventory_items call is call index 4 (after BEGIN, SELECT PR,
    // SELECT items, SELECT inventory).
    const updateCall = mockClientQuery.mock.calls[4];
    const [newStock, newAvail, newAvg] = updateCall[1] as string[];
    expect(parseFloat(newAvg)).toBeCloseTo(86.67, 2);
    expect(parseFloat(newStock)).toBeCloseTo(150, 3);
    expect(parseFloat(newAvail)).toBeCloseTo(150, 3); // no reservations
  });

  // ── 5. Available stock accounts for both reservation buckets ─────────────────
  // Existing: 100 units, 20 style-reserved, 10 swatch-reserved. Receive 50.
  // New stock = 150, available = 150 - 20 - 10 = 120.
  it("subtracts both reservation buckets when computing available stock", async () => {
    configureSuccessfulConfirm(
      "draft",
      { currentStock: "100.000", avgPrice: "80.00", styleRes: "20", swatchRes: "10" },
      { qty: "50.000", price: "100.00" },
    );

    await request(makeApp()).post("/purchase-receipts/1/confirm");

    const updateCall = mockClientQuery.mock.calls[4];
    const [, newAvail] = updateCall[1] as string[];
    expect(parseFloat(newAvail)).toBeCloseTo(120, 3);
  });

  // ── 6. Available stock is never negative ──────────────────────────────────────
  // Existing: 10 units, 15 style-reserved (over-reserved). Receive 5.
  // New stock = 15, available = max(0, 15-15-0) = 0.
  it("clamps available stock to 0 when reservations exceed new stock", async () => {
    configureSuccessfulConfirm(
      "draft",
      { currentStock: "10.000", avgPrice: "50.00", styleRes: "15", swatchRes: "0" },
      { qty: "5.000", price: "50.00" },
    );

    await request(makeApp()).post("/purchase-receipts/1/confirm");

    const updateCall = mockClientQuery.mock.calls[4];
    const [, newAvail] = updateCall[1] as string[];
    expect(parseFloat(newAvail)).toBe(0);
  });

  // ── 7. First receipt: average price becomes the unit price ───────────────────
  // No existing stock (prevStock = 0). Receiving 30 @ ₹200.
  // New avg = 200 (the unit price of the receipt).
  it("sets average price to unit price when there is no existing stock", async () => {
    configureSuccessfulConfirm(
      "draft",
      { currentStock: "0.000", avgPrice: "0.00" },
      { qty: "30.000", price: "200.00" },
    );

    await request(makeApp()).post("/purchase-receipts/1/confirm");

    const updateCall = mockClientQuery.mock.calls[4];
    const [, , newAvg] = updateCall[1] as string[];
    expect(parseFloat(newAvg)).toBeCloseTo(200, 2);
  });

  // ── 8. Status is updated to 'confirmed' ───────────────────────────────────────
  it("issues the UPDATE to set status to 'confirmed'", async () => {
    configureSuccessfulConfirm();

    await request(makeApp()).post("/purchase-receipts/1/confirm");

    const allSqls = mockClientQuery.mock.calls.map((c: unknown[]) => String(c[0]));
    expect(allSqls.some((sql: string) => sql.includes("status = 'confirmed'"))).toBe(true);
  });

  // ── 9. COMMIT is issued on success ────────────────────────────────────────────
  it("issues COMMIT on a successful confirm", async () => {
    configureSuccessfulConfirm();

    await request(makeApp()).post("/purchase-receipts/1/confirm");

    const allSqls = mockClientQuery.mock.calls.map((c: unknown[]) => String(c[0]));
    expect(allSqls.some((sql: string) => sql.includes("COMMIT"))).toBe(true);
  });

  // ── 10. DB error → ROLLBACK issued ───────────────────────────────────────────
  it("issues ROLLBACK and returns 500 when a DB error occurs", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [prRow("draft")] })  // SELECT inv_receipts
      .mockResolvedValueOnce({ rows: [itemRow()] })       // SELECT items
      .mockRejectedValueOnce(new Error("DB error"))       // SELECT inventory throws
      .mockResolvedValueOnce({ rows: [] });               // ROLLBACK

    const res = await request(makeApp()).post("/purchase-receipts/1/confirm");

    expect(res.status).toBe(500);
    const allSqls = mockClientQuery.mock.calls.map((c: unknown[]) => String(c[0]));
    expect(allSqls.some((sql: string) => sql.includes("ROLLBACK"))).toBe(true);
    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 11. Pool client always released on success ────────────────────────────────
  it("releases the pool client on a successful confirm", async () => {
    configureSuccessfulConfirm();

    await request(makeApp()).post("/purchase-receipts/1/confirm");

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 12. Pool client released even on 422 ──────────────────────────────────────
  it("releases the pool client even when the PR is already confirmed", async () => {
    mockClientQuery.mockResolvedValueOnce({ rows: [prRow("confirmed")] });

    await request(makeApp()).post("/purchase-receipts/1/confirm");

    expect(mockRelease).toHaveBeenCalledOnce();
  });

  // ── 13. Inventory not found → 500 and ROLLBACK ────────────────────────────────
  it("returns 500 if an inventory item referenced by the PR does not exist", async () => {
    mockClientQuery
      .mockResolvedValueOnce({ rows: [prRow("draft")] })  // SELECT inv_receipts
      .mockResolvedValueOnce({ rows: [itemRow()] })       // SELECT items
      .mockResolvedValueOnce({ rows: [] })                // SELECT inventory → empty (item not found)
      .mockResolvedValueOnce({ rows: [] });               // ROLLBACK

    const res = await request(makeApp()).post("/purchase-receipts/1/confirm");

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/not found/i);
    expect(mockRelease).toHaveBeenCalledOnce();
  });
});
