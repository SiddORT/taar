import { pgTable, serial, varchar, text, integer, numeric, boolean, timestamp, index, uniqueIndex, } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { vendorsTable } from "./vendors";
import { paymentTerms } from "./paymentTerms";

export const tradingPurchaseProduct = pgTable(
  "trading_purchase_product",
  {
    id: serial("id").primaryKey(),
    purchaseNumber: varchar("purchase_number", { length: 50 }).notNull(),
    purchaseDate: timestamp("purchase_date", { withTimezone: false }).notNull(),
    vendorId: integer("vendor_id").notNull().references(() => vendorsTable.id),
    vendorInvoiceNumber: varchar("vendor_invoice_number", { length: 100 }),
    supplierPoNumber: varchar("supplier_po_number", { length: 100 }),
    paymentTermId: integer("payment_term_id"),
    dueDate: timestamp("due_date", { withTimezone: false }),
    notes: text("notes"),
    freight: numeric("freight", { precision: 14, scale: 2 }).default("0").notNull(),
    otherCharges: numeric("other_charges", { precision: 14, scale: 2 }).default("0").notNull(),
    transportation: numeric("transportation", { precision: 14, scale: 2 }).default("0").notNull(),
    insurance: numeric("insurance", { precision: 14, scale: 2 }).default("0").notNull(),
    discount: numeric("discount", { precision: 14, scale: 2 }).default("0").notNull(),
    remarks: text("remarks"),
    subtotal: numeric("subtotal", { precision: 14, scale: 2 }).default("0").notNull(),
    totalGstAmount: numeric("total_gst_amount", { precision: 14, scale: 2 }).default("0").notNull(),
    taxableAmount: numeric("taxable_amount", { precision: 14, scale: 2 }).default("0").notNull(),
    grandTotal: numeric("grand_total", { precision: 14, scale: 2 }).default("0").notNull(),
    paidAmount: numeric("paid_amount", { precision: 14, scale: 2 }).default("0").notNull(),
    balanceAmount: numeric("balance_amount", { precision: 14, scale: 2 }).default("0").notNull(),
    paymentStatus: varchar("payment_status", { length: 20 }).default("Pending").notNull(),

    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedBy: integer("deleted_by").references(() => usersTable.id),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),

    createdBy: integer("created_by").notNull().references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedBy: integer("updated_by").references(() => usersTable.id),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (t) => ({
    uniqPurchaseNumber: uniqueIndex("tpp_purchase_number_uq").on(t.purchaseNumber),
    idxVendor: index("tpp_vendor_idx").on(t.vendorId),
    idxPurchaseDate: index("tpp_purchase_date_idx").on(t.purchaseDate),
    idxPaymentStatus: index("tpp_payment_status_idx").on(t.paymentStatus),
  })
);

// ─── Types ────────────────────────────────────────────────────────────────────
export type TradingPurchaseProduct = typeof tradingPurchaseProduct.$inferSelect;
export type NewTradingPurchaseProduct = typeof tradingPurchaseProduct.$inferInsert;

// ─── Zod Validation ───────────────────────────────────────────────────────────

const decimalString = z
  .union([z.string(), z.number()])
  .transform((v) => String(v))
  .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
    message: "Must be a non-negative number",
  });

export const purchaseItemSchema = z.object({
  productId: z.union([z.string(), z.number()]).transform(String),
  warehouseId:z .union([z.string(), z.number(), z.null()]) .transform((v) => (v == null || v === "" ? null : String(v))) .optional(),
  size: z.string().max(20).optional().nullable(),
  quantity: decimalString,
  rate: decimalString,
  hsnCode: z.string().min(1, "HSN code is required").max(20),
  gstPercentage: decimalString,
  gstAmount: decimalString.optional(),
  amount: decimalString.optional(),
});

export const insertTradingPurchaseSchema = z.object({
  purchaseNumber: z.string().min(1).max(50).optional(),
  purchaseDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid purchase date"),
  vendorId: z.coerce.number().int().positive("Vendor is required"),
  vendorInvoiceNumber: z.string().max(100).optional().nullable(),
  supplierPoNumber: z.string().max(100).optional().nullable(),
  paymentTermId: z.coerce.number().int().positive().optional().nullable(),
  dueDate: z.string().refine((d) => !d || !isNaN(Date.parse(d)), "Invalid due date").optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(purchaseItemSchema).min(1, "At least one item is required"),
  freight: decimalString.default("0"),
  otherCharges: decimalString.default("0"),
  transportation: decimalString.default("0"),
  insurance: decimalString.default("0"),
  discount: decimalString.default("0"),
  remarks: z.string().optional().nullable(),
  paidAmount: decimalString.default("0"),
  paymentStatus: z.enum(["Pending", "Partial", "Paid"]).default("Pending"),
});

export const updateTradingPurchaseSchema = insertTradingPurchaseSchema.partial();

export type InsertTradingPurchase = z.infer<typeof insertTradingPurchaseSchema>;
export type UpdateTradingPurchase = z.infer<typeof updateTradingPurchaseSchema>;