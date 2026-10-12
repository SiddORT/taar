import {
  pgTable, serial, varchar, text, integer, numeric, boolean, timestamp, index, uniqueIndex,
} from "drizzle-orm/pg-core";

export const tradingPurchaseProduct = pgTable(
  "trading_purchase_product",
  {
    id: serial("id").primaryKey(),
    purchaseNumber: varchar("purchase_number", { length: 50 }).notNull(),
    purchaseDate: timestamp("purchase_date", { withTimezone: false }).notNull(),
    vendorId: integer("vendor_id").notNull(),
    vendorInvoiceNumber: varchar("vendor_invoice_number", { length: 100 }),
    supplierPoNumber: varchar("supplier_po_number", { length: 100 }),
    paymentTerms: varchar("payment_terms", { length: 50 }),
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
    paymentStatus: varchar("payment_status", { length: 20 }).default("Pending").notNull(), // Pending | Partial | Paid
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedBy: integer("deleted_by"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),

    createdBy: integer("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedBy: integer("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (t) => ({
    uniqPurchaseNumber: uniqueIndex("tpp_purchase_number_uq").on(t.purchaseNumber),
    idxVendor: index("tpp_vendor_idx").on(t.vendorId),
    idxPurchaseDate: index("tpp_purchase_date_idx").on(t.purchaseDate),
    idxPaymentStatus: index("tpp_payment_status_idx").on(t.paymentStatus),
  })
);

export type TradingPurchaseProduct = typeof tradingPurchaseProduct.$inferSelect;
export type NewTradingPurchaseProduct = typeof tradingPurchaseProduct.$inferInsert;