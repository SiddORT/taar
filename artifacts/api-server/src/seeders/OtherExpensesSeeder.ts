import {
  db,
  otherExpenses,
  vendorLedgerChargesTable,
  vendorsTable,
  usersTable,
  hsnTable,
  sql,
} from "@workspace/db";

import { eq, and, desc } from "drizzle-orm";

// ============================================
// Constants
// ============================================

const DEFAULT_CATEGORIES = [
  "Courier Charges",
  "Office Expenses",
  "Packaging Expenses",
  "Sampling Misc Expenses",
  "Transport Charges",
  "Utility Expenses",
  "Other",
];

const PAYMENT_TYPES = [
  "Cash",
  "Bank Transfer",
  "UPI",
  "Cheque",
  "Online",
  "Other",
];

const PAYMENT_STATUS = [
  "Unpaid",
  "Partially Paid",
  "Paid",
];

const REF_TYPES = [
  "Manual",
  "Purchase Order",
  "Purchase Receipt",
  "Vendor Bill",
  "Other",
];

// ============================================
// Configuration
// ============================================

const SEED_COUNT = {
  WITH_VENDOR: 14,
  WITHOUT_VENDOR: 6,
};

// ============================================
// Types
// ============================================

interface Hsn {
  id: number;
  hsnCode: string;
  gstPercentage: string;
}

// ============================================
// Helper Functions
// ============================================

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate expense number exactly like the API.
 *
 * Example:
 * EXP-2026-00001
 * EXP-2026-00002
 */
async function generateExpenseNumber(tx: any): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `EXP-${year}-%`;

  const result = await tx
    .select({
      expenseNumber: otherExpenses.expenseNumber,
    })
    .from(otherExpenses)
    .where(
      sql`${otherExpenses.expenseNumber} LIKE ${pattern}
        AND ${otherExpenses.isDeleted} = false`
    )
    .orderBy(desc(otherExpenses.expenseNumber))
    .limit(1);

  let seq = 1;

  if (result.length > 0) {
    const last = result[0].expenseNumber;

    const parts = last.split("-");

    if (parts.length === 3) {
      const lastSequence = parseInt(parts[2], 10);

      if (!Number.isNaN(lastSequence)) {
        seq = lastSequence + 1;
      }
    }
  }

  return `EXP-${year}-${String(seq).padStart(5, "0")}`;
}

// ============================================
// Main Seeder
// ============================================

export async function seedOtherExpenses(): Promise<void> {
  console.log("\n💰 Starting OtherExpensesSeeder...");

  // ============================================
  // 1. Idempotency Check
  // ============================================

  const existing = await db
    .select({
      id: otherExpenses.expenseId,
    })
    .from(otherExpenses)
    .where(
      and(
        sql`${otherExpenses.remarks} LIKE '%Seeder%'`,
        eq(otherExpenses.isDeleted, false)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    console.log(
      "[seedOtherExpenses] Other expenses already seeded. Skipping."
    );
    return;
  }

  // ============================================
  // 2. Fetch Active User
  // ============================================

  const users = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.isActive, true),
        eq(usersTable.isDeleted, false)
      )
    )
    .limit(1);

  const actor =
    users.length > 0
      ? users[0].email || users[0].username || "System"
      : "System";

  console.log(
    `[seedOtherExpenses] Using actor: ${actor}`
  );

  // ============================================
  // 3. Fetch Active Vendors
  // ============================================

  const vendors = await db
    .select()
    .from(vendorsTable)
    .where(
      and(
        eq(vendorsTable.isActive, true),
        eq(vendorsTable.isDeleted, false)
      )
    );

  console.log(
    `[seedOtherExpenses] Found ${vendors.length} active vendors`
  );

  if (vendors.length === 0) {
    console.warn(
      "[seedOtherExpenses] No active vendors found. Only standalone expenses will be created."
    );
  }

  // ============================================
  // 4. Fetch Active HSN Codes
  // ============================================

  const hsnCodes: Hsn[] = await db
    .select({
      id: hsnTable.id,
      hsnCode: hsnTable.hsnCode,
      gstPercentage: hsnTable.gstPercentage,
    })
    .from(hsnTable)
    .where(
      and(
        eq(hsnTable.isActive, true),
        eq(hsnTable.isDeleted, false)
      )
    );

  console.log(
    `[seedOtherExpenses] Found ${hsnCodes.length} active HSN codes`
  );

  // HSN is mandatory in other_expenses.
  if (hsnCodes.length === 0) {
    console.error(
      "[seedOtherExpenses] No active HSN codes found."
    );

    console.error(
      "[seedOtherExpenses] Please run the HSN seeder before running OtherExpensesSeeder."
    );

    return;
  }

  // ============================================
  // 5. Transaction
  // ============================================

  await db.transaction(async (tx) => {
    // ============================================
    // Vendor-linked Expenses
    // ============================================

    const vendorCount = vendors.length;

    const withVendorCount =
      vendorCount > 0
        ? Math.min(
            SEED_COUNT.WITH_VENDOR,
            vendorCount * 3
          )
        : 0;

    console.log(
      `[seedOtherExpenses] Creating ${withVendorCount} vendor-linked expenses`
    );

    for (let i = 0; i < withVendorCount; i++) {
      const vendor = vendors[i % vendorCount];

      const category = randomItem(DEFAULT_CATEGORIES);

      const amount =
        Math.floor(Math.random() * 5000) + 500;

      const paymentStatus =
        randomItem(PAYMENT_STATUS);

      const paymentType =
        randomItem(PAYMENT_TYPES);

      const referenceType =
        randomItem(REF_TYPES);

      // ============================================
      // Pick ONE HSN
      // ============================================
      // The exact same HSN is used for:
      // 1. other_expenses
      // 2. vendor_ledger_charges

      const hsn = randomItem(hsnCodes);

      const expenseNumber =
        await generateExpenseNumber(tx);

      const expenseDate =
        new Date().toISOString().split("T")[0];

      const vendorName =
        vendor.brandName ||
        vendor.contactName ||
        "";

      // ============================================
      // Insert Other Expense
      // ============================================

      await tx
        .insert(otherExpenses)
        .values({
          expenseNumber,
          expenseCategory: category,

          // Vendor
          vendorId: vendor.id,
          vendorName,

          // Reference
          referenceType,
          referenceId: "",

          // Amount
          amount: String(amount),
          currencyCode: "INR",

          // Payment
          paymentStatus,
          paymentType,

          paidAmount:
            paymentStatus === "Paid"
              ? String(amount)
              : "0",

          // Date
          expenseDate,

          // Additional information
          remarks:
            `Seeder - ${category} (vendor: ${vendorName})`,

          attachment: "",

          // Audit
          createdBy: actor,

          // ==========================================
          // HSN Details
          // ==========================================

          hsnId: hsn.id,
          hsnCode: hsn.hsnCode,
          gstPercentage:
            hsn.gstPercentage || "5",
        });

      // ============================================
      // Insert Corresponding Vendor Ledger Charge
      // ============================================
      //
      // IMPORTANT:
      // The HSN values below are from the SAME `hsn`
      // object used for the other_expenses record.
      //
      // This keeps:
      //
      // other_expenses.hsn_id
      // vendor_ledger_charges.hsn_id
      //
      // identical.
      //
      // Same applies to:
      // hsn_code
      // gst_percentage
      // ============================================

      await tx
        .insert(vendorLedgerChargesTable)
        .values({
          // Vendor
          vendorId: vendor.id,
          vendorName,

          // Charge information
          chargeDate:
            sql`${expenseDate}::timestamp`,

          description:
            `Other Expense: ${category} [${expenseNumber}]`,

          amount: String(amount),

          notes:
            `Seeder - ${category}`,

          orderType: "other_expense",

          // Audit
          createdBy: actor,

          // ==========================================
          // SAME HSN DETAILS
          // ==========================================

          hsnId: hsn.id,
          hsnCode: hsn.hsnCode,
          gstPercentage:
            hsn.gstPercentage || "5",
        });

      console.log(
        `[seedOtherExpenses] Created ${expenseNumber} for vendor ${vendorName} | HSN: ${hsn.hsnCode} | GST: ${hsn.gstPercentage}%`
      );
    }

    // ============================================
    // Standalone Expenses
    // ============================================

    const withoutVendorCount =
      vendorCount > 0
        ? SEED_COUNT.WITHOUT_VENDOR
        : 20;

    console.log(
      `[seedOtherExpenses] Creating ${withoutVendorCount} standalone expenses`
    );

    for (let i = 0; i < withoutVendorCount; i++) {
      const category =
        randomItem(DEFAULT_CATEGORIES);

      const amount =
        Math.floor(Math.random() * 3000) + 200;

      const paymentStatus =
        randomItem(PAYMENT_STATUS);

      const paymentType =
        randomItem(PAYMENT_TYPES);

      const referenceType =
        randomItem(REF_TYPES);

      // ============================================
      // Pick HSN
      // ============================================

      const hsn = randomItem(hsnCodes);

      const expenseNumber =
        await generateExpenseNumber(tx);

      const expenseDate =
        new Date().toISOString().split("T")[0];

      // ============================================
      // Insert Standalone Other Expense
      // ============================================

      await tx
        .insert(otherExpenses)
        .values({
          expenseNumber,
          expenseCategory: category,

          // No vendor
          vendorId: null,
          vendorName: "",

          // Reference
          referenceType,
          referenceId: "",

          // Amount
          amount: String(amount),
          currencyCode: "INR",

          // Payment
          paymentStatus,
          paymentType,

          paidAmount:
            paymentStatus === "Paid"
              ? String(amount)
              : "0",

          // Date
          expenseDate,

          // Additional information
          remarks:
            `Seeder - ${category} (no vendor)`,

          attachment: "",

          // Audit
          createdBy: actor,

          // ==========================================
          // HSN Details
          // ==========================================

          hsnId: hsn.id,
          hsnCode: hsn.hsnCode,
          gstPercentage:
            hsn.gstPercentage || "5",
        });

      // ============================================
      // NOTE:
      // No vendor ledger record is created here
      // because this expense has no vendor.
      // ============================================

      console.log(
        `[seedOtherExpenses] Created ${expenseNumber} (no vendor) | HSN: ${hsn.hsnCode} | GST: ${hsn.gstPercentage}%`
      );
    }
  });

  // ============================================
  // Completed
  // ============================================

  console.log(
    `\n✅ [seedOtherExpenses] Seed completed successfully!`
  );

  console.log(
    `   Vendor-linked: ${SEED_COUNT.WITH_VENDOR}`
  );

  console.log(
    `   Standalone: ${SEED_COUNT.WITHOUT_VENDOR}`
  );

  console.log(
    `   Total: ${
      SEED_COUNT.WITH_VENDOR +
      SEED_COUNT.WITHOUT_VENDOR
    }`
  );
}
