import {
  db,
  otherExpenses,
  vendorLedgerChargesTable,
  vendorsTable,
  usersTable,
  sql,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const DEFAULT_CATEGORIES = [
  "Courier Charges",
  "Office Expenses",
  "Packaging Expenses",
  "Sampling Misc Expenses",
  "Transport Charges",
  "Utility Expenses",
  "Other",
];

// Use exactly the provided constants
const PAYMENT_TYPES = ["Cash", "Bank Transfer", "UPI", "Cheque", "Online", "Other"];
const PAYMENT_STATUS = ["Unpaid", "Partially Paid", "Paid"];
const REF_TYPES = ["Manual", "Purchase Order", "Purchase Receipt", "Vendor Bill", "Other"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate expense number exactly like the API (e.g., EXP-2026-00001)
async function generateExpenseNumber(tx: any): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `EXP-${year}-%`;

  const result = await tx
    .select({ expenseNumber: otherExpenses.expenseNumber })
    .from(otherExpenses)
    .where(
      sql`${otherExpenses.expenseNumber} LIKE ${pattern} AND ${otherExpenses.isDeleted} = false`
    )
    .orderBy(desc(otherExpenses.expenseNumber))
    .limit(1);

  let seq = 1;
  if (result.length > 0) {
    const last = result[0].expenseNumber;
    const parts = last.split("-");
    if (parts.length === 3) {
      seq = parseInt(parts[2], 10) + 1;
    }
  }
  return `EXP-${year}-${String(seq).padStart(5, "0")}`;
}

// Configuration: total 20 records
const SEED_COUNT = {
  WITH_VENDOR: 14,   // if vendors exist, create 14 vendor-linked
  WITHOUT_VENDOR: 6, // and 6 standalone
};

export async function seedOtherExpenses(): Promise<void> {
  // Idempotency: skip if any expense with "Seeder" in remarks exists
  const existing = await db
    .select({ id: otherExpenses.expenseId })
    .from(otherExpenses)
    .where(
      and(
        sql`${otherExpenses.remarks} LIKE '%Seeder%'`,
        eq(otherExpenses.isDeleted, false)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    console.log("[seedOtherExpenses] Other expenses already seeded. Skipping.");
    return;
  }

  // Fetch active user
  const users = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.isActive, true), eq(usersTable.isDeleted, false)))
    .limit(1);
  const actor = users.length ? users[0].email || users[0].username : "System";

  // Fetch active vendors
  const vendors = await db
    .select()
    .from(vendorsTable)
    .where(and(eq(vendorsTable.isActive, true), eq(vendorsTable.isDeleted, false)));

  if (!vendors.length) {
    console.warn("[seedOtherExpenses] No active vendors found. Only standalone expenses will be created.");
  }

  await db.transaction(async (tx) => {
    // --- Vendor-linked expenses ---
    const vendorCount = vendors.length;
    const withVendorCount = vendorCount > 0 ? Math.min(SEED_COUNT.WITH_VENDOR, vendorCount * 3) : 0;
    for (let i = 0; i < withVendorCount; i++) {
      const vendor = vendors[i % vendorCount];
      const category = randomItem(DEFAULT_CATEGORIES);
      const amount = Math.floor(Math.random() * 5000) + 500; // 500-5499
      const paymentStatus = randomItem(PAYMENT_STATUS);
      const paymentType = randomItem(PAYMENT_TYPES);
      const referenceType = randomItem(REF_TYPES);
      const expenseNumber = await generateExpenseNumber(tx);
      const expenseDate = new Date().toISOString().split("T")[0];

      // Insert expense
      await tx.insert(otherExpenses).values({
        expenseNumber,
        expenseCategory: category,
        vendorId: vendor.id,
        vendorName: vendor.brandName || vendor.contactName || "",
        referenceType,
        referenceId: "", // no specific ID for seeder
        amount: String(amount),
        currencyCode: "INR",
        paymentStatus,
        paymentType,
        paidAmount: paymentStatus === "Paid" ? String(amount) : "0",
        expenseDate,
        remarks: `Seeder - ${category} (vendor: ${vendor.brandName})`,
        attachment: "",
        createdBy: actor,
      });

      // Insert vendor ledger charge
      await tx.insert(vendorLedgerChargesTable).values({
        vendorId: vendor.id,
        vendorName: vendor.brandName || vendor.contactName || "",
        chargeDate: sql`${expenseDate}::timestamp`,
        description: `Other Expense: ${category} [${expenseNumber}]`,
        amount: String(amount),
        notes: `Seeder - ${category}`,
        orderType: "other_expense",
        createdBy: actor,
      });

      console.log(`[seedOtherExpenses] Created ${expenseNumber} for vendor ${vendor.brandName}`);
    }

    // --- Standalone expenses (no vendor) ---
    const withoutVendorCount = vendorCount > 0 ? SEED_COUNT.WITHOUT_VENDOR : 20;
    for (let i = 0; i < withoutVendorCount; i++) {
      const category = randomItem(DEFAULT_CATEGORIES);
      const amount = Math.floor(Math.random() * 3000) + 200; // 200-3199
      const paymentStatus = randomItem(PAYMENT_STATUS);
      const paymentType = randomItem(PAYMENT_TYPES);
      const referenceType = randomItem(REF_TYPES);
      const expenseNumber = await generateExpenseNumber(tx);
      const expenseDate = new Date().toISOString().split("T")[0];

      await tx.insert(otherExpenses).values({
        expenseNumber,
        expenseCategory: category,
        vendorId: null,
        vendorName: "",
        referenceType,
        referenceId: "",
        amount: String(amount),
        currencyCode: "INR",
        paymentStatus,
        paymentType,
        paidAmount: paymentStatus === "Paid" ? String(amount) : "0",
        expenseDate,
        remarks: `Seeder - ${category} (no vendor)`,
        attachment: "",
        createdBy: actor,
      });

      console.log(`[seedOtherExpenses] Created ${expenseNumber} (no vendor)`);
    }
  });

  console.log(
    `[seedOtherExpenses] Seeded a total of ${SEED_COUNT.WITH_VENDOR + SEED_COUNT.WITHOUT_VENDOR} expenses (${SEED_COUNT.WITH_VENDOR} vendor-linked, ${SEED_COUNT.WITHOUT_VENDOR} standalone).`
  );
}