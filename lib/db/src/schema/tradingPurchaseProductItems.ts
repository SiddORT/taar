import { pgTable, serial, integer, varchar, numeric, timestamp, index, } from "drizzle-orm/pg-core";

export const tradingPurchaseProductItems = pgTable(
  "trading_purchase_product_items",
  {
    id: serial("id").primaryKey(),

    // ── FK to header ──
    purchaseId: integer("purchase_id")
      .notNull(), 
    // ── Product ref (may be nullable at time of entry if product added later) ──
    productId: integer("product_id").notNull(),

    // ── Line details ──
    size: varchar("size", { length: 20 }),
    quantity: numeric("quantity", { precision: 14, scale: 3 }).default("0").notNull(),
    rate: numeric("rate", { precision: 14, scale: 2 }).default("0").notNull(),

    // ── Tax ──
    hsnCode: varchar("hsn_code", { length: 20 }).notNull(),
    gstPercentage: numeric("gst_percentage", { precision: 5, scale: 2 }).default("0").notNull(),
    gstAmount: numeric("gst_amount", { precision: 14, scale: 2 }).default("0").notNull(),

    // ── Line total = (qty × rate) + gstAmount ──
    amount: numeric("amount", { precision: 14, scale: 2 }).default("0").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (t) => ({
    idxPurchase: index("ppi_purchase_idx").on(t.purchaseId),
    idxProduct: index("ppi_product_idx").on(t.productId),
    idxHsn: index("ppi_hsn_idx").on(t.hsnCode),
  })
);

export type TradingPurchaseProductItem = typeof tradingPurchaseProductItems.$inferSelect;
export type NewTradingPurchaseProductItem = typeof tradingPurchaseProductItems.$inferInsert;