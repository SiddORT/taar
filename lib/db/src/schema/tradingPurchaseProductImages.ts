import {
  pgTable, serial, integer, varchar, text, bigint, timestamp, index,
} from "drizzle-orm/pg-core";

export const tradingPurchaseProductImages = pgTable(
  "trading_purchase_product_images",
  {
    id: serial("id").primaryKey(),

    tradingPurchaseProductId: integer("trading_purchase_product_id")
      .notNull(),
    // ── Stored path relative to your upload root, e.g. "/uploads/purchases/2026/01/xyz.pdf" ──
    imagePath: text("image_path").notNull(),

    // ── Original filename from the browser, e.g. "invoice-abc.pdf" ──
    originalName: varchar("original_name", { length: 255 }).notNull(),

    // ── MIME type — critical for distinguishing PDF vs image on the frontend ──
    mimeType: varchar("mime_type", { length: 100 }).notNull(),

    // ── File size in bytes ──
    fileSize: bigint("file_size", { mode: "number" }).notNull(),

    // ── Optional: order of display ──
    displayOrder: integer("display_order").default(0).notNull(),

    uploadedBy: integer("uploaded_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxPurchase: index("tppi_purchase_idx").on(t.tradingPurchaseProductId),
  })
);

export type TradingPurchaseProductImage = typeof tradingPurchaseProductImages.$inferSelect;
export type NewTradingPurchaseProductImage = typeof tradingPurchaseProductImages.$inferInsert;