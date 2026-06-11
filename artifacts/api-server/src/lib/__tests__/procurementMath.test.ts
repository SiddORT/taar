import { describe, it, expect } from "vitest";
import {
  computePoLineTotal,
  computePoTotal,
  computeNewAveragePrice,
  computeAvailableStock,
  convertPaymentToBillCcy,
  isOverpayment,
} from "../procurementMath";

// ─── computePoLineTotal ───────────────────────────────────────────────────────

describe("computePoLineTotal", () => {
  it("multiplies qty by unit price", () => {
    expect(computePoLineTotal(10, 250)).toBe(2500);
  });

  it("returns 0 when qty is 0", () => {
    expect(computePoLineTotal(0, 500)).toBe(0);
  });

  it("returns 0 when unit price is 0", () => {
    expect(computePoLineTotal(5, 0)).toBe(0);
  });

  it("handles fractional quantities (fabric/yarn in metres)", () => {
    expect(computePoLineTotal(2.5, 400)).toBeCloseTo(1000);
  });

  it("treats NaN qty as 0", () => {
    expect(computePoLineTotal(NaN, 100)).toBe(0);
  });

  it("treats NaN unit price as 0", () => {
    expect(computePoLineTotal(5, NaN)).toBe(0);
  });

  it("treats Infinity as 0", () => {
    expect(computePoLineTotal(Infinity, 100)).toBe(0);
  });
});

// ─── computePoTotal ───────────────────────────────────────────────────────────

describe("computePoTotal", () => {
  it("sums multiple line items", () => {
    const items = [
      { qty: 10, unitPrice: 100 },
      { qty: 5,  unitPrice: 200 },
      { qty: 2,  unitPrice: 50  },
    ];
    expect(computePoTotal(items)).toBe(2100);
  });

  it("returns 0 for an empty items array", () => {
    expect(computePoTotal([])).toBe(0);
  });

  it("returns the single line total for a one-item PO", () => {
    expect(computePoTotal([{ qty: 3, unitPrice: 750 }])).toBe(2250);
  });

  it("correctly totals fractional quantities", () => {
    const items = [
      { qty: 1.5, unitPrice: 200 },
      { qty: 0.5, unitPrice: 200 },
    ];
    expect(computePoTotal(items)).toBeCloseTo(400);
  });

  it("ignores items with zero price (free/sample items)", () => {
    const items = [
      { qty: 5,  unitPrice: 100 },
      { qty: 10, unitPrice: 0   },
    ];
    expect(computePoTotal(items)).toBe(500);
  });
});

// ─── computeNewAveragePrice ───────────────────────────────────────────────────

describe("computeNewAveragePrice", () => {
  it("basic weighted average: existing 100 @ ₹50, receive 100 @ ₹60 → ₹55", () => {
    const avg = computeNewAveragePrice(100, 50, 100, 60);
    expect(avg).toBeCloseTo(55);
  });

  it("first receipt (prevStock = 0): avg becomes the unit price of the receipt", () => {
    const avg = computeNewAveragePrice(0, 0, 50, 120);
    expect(avg).toBe(120);
  });

  it("receiving at same price leaves average unchanged", () => {
    const avg = computeNewAveragePrice(200, 80, 100, 80);
    expect(avg).toBeCloseTo(80);
  });

  it("receiving cheaper stock pulls average down", () => {
    const avg = computeNewAveragePrice(100, 100, 100, 50);
    expect(avg).toBeCloseTo(75);
  });

  it("receiving more expensive stock pushes average up", () => {
    const avg = computeNewAveragePrice(100, 50, 50, 200);
    expect(avg).toBeCloseTo(100);
  });

  it("fractional quantities: 50.5 existing @ ₹200, receive 10.5 @ ₹250", () => {
    const prevStock = 50.5;
    const prevAvg   = 200;
    const inQty     = 10.5;
    const unitPrice = 250;
    const newStock  = prevStock + inQty;
    const expected  = ((prevStock * prevAvg) + (inQty * unitPrice)) / newStock;
    expect(computeNewAveragePrice(prevStock, prevAvg, inQty, unitPrice)).toBeCloseTo(expected);
  });

  it("zero new stock after receipt returns unitPrice (defensive, avoids div/0)", () => {
    expect(computeNewAveragePrice(-10, 50, 10, 75)).toBe(75);
  });
});

// ─── computeAvailableStock ────────────────────────────────────────────────────

describe("computeAvailableStock", () => {
  it("subtracts both reservation buckets from total stock", () => {
    expect(computeAvailableStock(100, 20, 10)).toBe(70);
  });

  it("returns 0 when reservations exceed stock (no negative available stock)", () => {
    expect(computeAvailableStock(50, 40, 20)).toBe(0);
  });

  it("returns full stock when there are no reservations", () => {
    expect(computeAvailableStock(200, 0, 0)).toBe(200);
  });

  it("returns 0 when stock exactly equals total reserved", () => {
    expect(computeAvailableStock(100, 60, 40)).toBe(0);
  });

  it("handles fractional stock and reservations", () => {
    expect(computeAvailableStock(10.5, 3.25, 2.5)).toBeCloseTo(4.75);
  });
});

// ─── convertPaymentToBillCcy ──────────────────────────────────────────────────

describe("convertPaymentToBillCcy", () => {
  it("INR payment on INR bill (rate 1×1): identity", () => {
    expect(convertPaymentToBillCcy(5000, 1, 1)).toBe(5000);
  });

  it("USD payment on USD bill (same currency, rate 83): identity", () => {
    // 100 USD paid at rate 83 → base = 8300; bill is also USD at rate 83 → 8300/83 = 100
    expect(convertPaymentToBillCcy(100, 83, 83)).toBeCloseTo(100);
  });

  it("INR payment on USD bill: converts correctly", () => {
    // Paying 8300 INR (rate 1) toward a USD bill at rate 83 → 8300/83 ≈ 100 USD
    expect(convertPaymentToBillCcy(8300, 1, 83)).toBeCloseTo(100);
  });

  it("USD payment on GBP bill: cross-currency via INR anchor", () => {
    // 100 USD at rate 83 → base 8300 INR; bill is GBP at rate 100 → 8300/100 = 83 GBP
    expect(convertPaymentToBillCcy(100, 83, 100)).toBeCloseTo(83);
  });

  it("treats billRate 0 as 1 (defensive: avoids division-by-zero)", () => {
    expect(convertPaymentToBillCcy(1000, 1, 0)).toBe(1000);
  });
});

// ─── isOverpayment ────────────────────────────────────────────────────────────

describe("isOverpayment", () => {
  it("exact payment of remaining balance is NOT an overpayment", () => {
    expect(isOverpayment(500, 1000, 500)).toBe(false);
  });

  it("partial payment is NOT an overpayment", () => {
    expect(isOverpayment(400, 1000, 400)).toBe(false);
  });

  it("payment exceeding remaining balance IS an overpayment", () => {
    // 600 remaining (1000 - 400), paying 700 → overpay
    expect(isOverpayment(700, 1000, 400)).toBe(true);
  });

  it("first payment on a fully unpaid bill: no overpayment if ≤ total", () => {
    expect(isOverpayment(1000, 1000, 0)).toBe(false);
  });

  it("first payment exceeding total IS an overpayment", () => {
    expect(isOverpayment(1001, 1000, 0)).toBe(true);
  });

  it("allows ≤ 0.01 tolerance for floating-point residuals", () => {
    // Paying 1000.005 when remaining is 1000 → within tolerance, NOT overpayment
    expect(isOverpayment(1000.005, 1000, 0)).toBe(false);
  });

  it("0.02 above remaining IS an overpayment (outside tolerance)", () => {
    expect(isOverpayment(1000.02, 1000, 0)).toBe(true);
  });

  it("payment on an already fully-paid bill IS an overpayment", () => {
    expect(isOverpayment(1, 1000, 1000)).toBe(true);
  });

  it("zero payment is never an overpayment", () => {
    expect(isOverpayment(0, 1000, 0)).toBe(false);
  });
});
