/**
 * Payment routes with SQL-aware fixtures. Match query meaning rather than a
 * fixed call count so balance reads cannot accidentally consume source rows.
 * No real database is touched.
 */
import { vi, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

const { query, release, connect, recompute } = vi.hoisted(() => ({
  query: vi.fn(), release: vi.fn(), connect: vi.fn(), recompute: vi.fn(),
}));
vi.mock("@workspace/db", () => ({
  pool: { connect, query: vi.fn() },
  db: { select: vi.fn().mockReturnThis(), from: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValue([]) },
}));
vi.mock("../../middlewares/requireAuth", () => ({
  requireAuth: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.user = { userId: 1, email: "tester@example.invalid", role: "admin" };
    next();
  },
}));
vi.mock("../../lib/vendorBillBalances", () => ({ recomputeVendorBillBalances: recompute }));
import router from "../accountPurchases";

function app() {
  const server = express();
  server.use(express.json(), router);
  return server;
}
const payload = (ref: string, amount = "500") => ({
  ref_type: ref, source_id: "1", vendor_id: 10, vendor_name: "Test Vendor",
  payment_amount: amount, payment_date: "2026-06-01",
  payment_type: "Bank Transfer", currency_code: "INR", exchange_rate_snapshot: "1",
});
const sqlCalls = () => query.mock.calls.map(([sql]) => String(sql).replace(/\s+/g, " ").trim());
const writes = () => sqlCalls().filter(sql => /^(INSERT|UPDATE|DELETE)\b/i.test(sql));

function sourceFixture(ref: string, total = "2000", paid = "0", exists = true) {
  const table = ref === "Other Expense" ? "other_expenses"
    : ref === "Purchase Receipt" ? "purchase_receipts" : "outsource_jobs";
  const source = {
    id: 1, expense_id: 1, vendor_id: 10, vendor_name: "Test Vendor",
    total_cost: total, amount: total, gst_percentage: "0", paid_amount: paid,
    swatch_order_id: null, style_order_id: null, is_deleted: false,
  };
  query.mockImplementation(async (text: string) => {
    const sql = text.replace(/\s+/g, " ").trim();
    if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(sql)) return { rows: [] };
    if (sql.includes(`FROM ${table}`)) {
      if (!exists) return { rows: [] };
      if (/\bAS total\b/i.test(sql)) return { rows: [{ total, paid }] };
      return { rows: [source] };
    }
    if (/FROM vendor_ledger_charges/i.test(sql)) return { rows: [{ id: 77 }] };
    if (/^INSERT INTO (costing_payments|vendor_payments)/i.test(sql)) return { rows: [{ id: 101 }] };
    if (/^UPDATE other_expenses/i.test(sql)) return { rows: [] };
    throw new Error(`Unexpected fixture query: ${sql}`);
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  connect.mockResolvedValue({ query, release });
  recompute.mockResolvedValue({ totalAmount: 5000, paidAmount: 500, pendingAmount: 4500, status: "Partially Paid" });
});

describe.each([
  ["Costing Outsource", "outsource_jobs", "INSERT INTO costing_payments"],
  ["Other Expense", "other_expenses", "UPDATE other_expenses"],
])("POST /record-payment — %s", (ref, table, mutation) => {
  it("records a valid payment, commits, and releases the client", async () => {
    sourceFixture(ref);
    const res = await request(app()).post("/record-payment").send(payload(ref));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Vendor payment recorded successfully" });
    expect(sqlCalls().at(-1)).toBe("COMMIT");
    expect(release).toHaveBeenCalledOnce();
    expect(writes().some(sql => sql.startsWith(mutation))).toBe(true);
  });

  it("rejects a missing or deleted source and rolls back without a write", async () => {
    sourceFixture(ref, "2000", "0", false);
    const res = await request(app()).post("/record-payment").send(payload(ref));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(`Source record not found for ${ref} #1`);
    expect(sqlCalls()[1]).toMatch(/is_deleted = false FOR UPDATE/);
    expect(writes()).toEqual([]);
    expect(sqlCalls().at(-1)).toBe("ROLLBACK");
    expect(release).toHaveBeenCalledOnce();
  });

  it("rejects zero before reading a source or writing payment data", async () => {
    sourceFixture(ref);
    const res = await request(app()).post("/record-payment").send(payload(ref, "0"));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/must be > 0/i);
    expect(sqlCalls()).toEqual(["BEGIN", "ROLLBACK"]);
    expect(release).toHaveBeenCalledOnce();
  });

  it("locks the non-deleted source BEFORE the balance read and all mutations", async () => {
    sourceFixture(ref);
    const res = await request(app()).post("/record-payment").send(payload(ref));
    expect(res.status).toBe(200);
    const sqls = sqlCalls();
    const lock = sqls.findIndex(sql => /FOR UPDATE/.test(sql));
    const balance = sqls.findIndex(sql => /\bAS total\b/i.test(sql));
    const write = sqls.findIndex(sql => sql.startsWith(mutation));
    expect(lock).toBeGreaterThan(0);
    expect(sqls[lock]).toContain(`FROM ${table}`);
    expect(sqls[lock]).toContain("is_deleted = false");
    expect(lock).toBeLessThan(balance);
    expect(balance).toBeLessThan(write);
    expect(write).toBeLessThan(sqls.indexOf("COMMIT"));
  });

  it("rejects overpayment using the already-paid balance with no mutations", async () => {
    sourceFixture(ref, "2000", "1800");
    const res = await request(app()).post("/record-payment").send(payload(ref, "500"));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Payment exceeds balance/);
    expect(res.body.error).toContain("Max allowed: 200.00");
    expect(writes()).toEqual([]);
    expect(sqlCalls().at(-1)).toBe("ROLLBACK");
  });

  it("converts a foreign-currency payment to INR before checking the balance", async () => {
    sourceFixture(ref, "2000", "1800");
    const res = await request(app()).post("/record-payment").send({
      ...payload(ref, "3"), currency_code: "USD", exchange_rate_snapshot: "83",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Attempting: 249.00");
    expect(writes()).toEqual([]);
  });

  it("rolls back and releases the client when a source read fails", async () => {
    sourceFixture(ref);
    query.mockImplementationOnce(async () => ({ rows: [] }))
      .mockRejectedValueOnce(new Error("Read failed"));
    const res = await request(app()).post("/record-payment").send(payload(ref));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Read failed");
    expect(sqlCalls().at(-1)).toBe("ROLLBACK");
    expect(release).toHaveBeenCalledOnce();
    expect(writes()).toEqual([]);
  });
});

describe("Other Expense status and balances", () => {
  it.each([["1000", "Partially Paid"], ["2000", "Paid"]])(
    "payment %s persists %s and the correct paid amount",
    async (amount, status) => {
      sourceFixture("Other Expense");
      const res = await request(app()).post("/record-payment").send(payload("Other Expense", amount));
      expect(res.status).toBe(200);
      const update = query.mock.calls.find(([sql]) => /UPDATE other_expenses/i.test(sql));
      expect(update?.[1]).toEqual([Number(amount), status, 1]);
      expect(writes().some(sql => sql.startsWith("INSERT INTO vendor_payments"))).toBe(true);
      const insert = query.mock.calls.find(([sql]) => /INSERT INTO vendor_payments/i.test(sql));
      expect(insert?.[1]?.slice(-2)).toEqual(["ledger_charge", 77]);
    }
  );
});

// Vendor-ledger bill status guards belong to this endpoint, not to the
// newer purchase-receipt payment flow (which operates on purchase_receipts).
describe("POST /vendor-bills/:id/payment — status guards", () => {
  function billFixture(status: string | null) {
    query.mockImplementation(async (text: string) => {
      if (/FROM vendor_invoice_ledger/.test(text)) return { rows: status ? [{
        id: 1, vendor_id: 10, vendor_name: "Test Vendor",
        vendor_invoice_amount: "5000", paid_amount: status === "Paid" ? "5000" : "0",
        exchange_rate_snapshot: "1", currency_code: "INR", status,
      }] : [] };
      if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(text)) return { rows: [] };
      throw new Error(`Unexpected bill fixture query: ${text}`);
    });
  }
  it.each(["Cancelled", "Paid"])("rejects a %s bill under lock", async status => {
    billFixture(status);
    const res = await request(app()).post("/vendor-bills/1/payment").send(payload("Purchase Receipt"));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(status === "Paid" ? /fully paid/i : /cancelled/i);
    expect(sqlCalls()[1]).toMatch(/vendor_invoice_ledger.*FOR UPDATE/);
    expect(writes()).toEqual([]);
    expect(recompute).not.toHaveBeenCalled();
    expect(sqlCalls().at(-1)).toBe("ROLLBACK");
    expect(release).toHaveBeenCalledOnce();
  });
  it("returns 404 for a missing bill and releases the connection", async () => {
    billFixture(null);
    const res = await request(app()).post("/vendor-bills/999/payment").send(payload("Purchase Receipt"));
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Bill not found");
    expect(sqlCalls().at(-1)).toBe("ROLLBACK");
    expect(release).toHaveBeenCalledOnce();
    expect(writes()).toEqual([]);
  });
});

describe("Purchase Receipt balance validation", () => {
  it("rejects a missing receipt before any writes", async () => {
    sourceFixture("Purchase Receipt", "5000", "0", false);
    const res = await request(app()).post("/record-payment").send(payload("Purchase Receipt"));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Source record not found for Purchase Receipt #1");
    expect(writes()).toEqual([]);
  });
  it("locks the receipt and rejects a payment exceeding the remaining amount", async () => {
    sourceFixture("Purchase Receipt", "5000", "4800");
    const res = await request(app()).post("/record-payment").send(payload("Purchase Receipt"));
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Max allowed: 200.00");
    expect(sqlCalls()[1]).toMatch(/FROM purchase_receipts.*FOR UPDATE/);
    expect(writes()).toEqual([]);
  });
});
