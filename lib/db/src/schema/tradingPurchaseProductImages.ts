import {
  pgTable, serial, integer, varchar, text, bigint, timestamp, index,
} from "drizzle-orm/pg-core";
import { tradingPurchaseProduct } from "./tradingPurchaseProduct";
import { usersTable } from "./users";

export const tradingPurchaseProductImages = pgTable(
  "trading_purchase_product_images",
  {
    id: serial("id").primaryKey(),

    tradingPurchaseProductId: integer("trading_purchase_product_id")
      .notNull()
      .references(() => tradingPurchaseProduct.id, { onDelete: "cascade" }),

    imagePath: text("image_path").notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),

    displayOrder: integer("display_order").default(0).notNull(),

    uploadedBy: integer("uploaded_by").references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    idxPurchase: index("tppi_purchase_idx").on(t.tradingPurchaseProductId),
  })
);

export type TradingPurchaseProductImage = typeof tradingPurchaseProductImages.$inferSelect;
export type NewTradingPurchaseProductImage = typeof tradingPurchaseProductImages.$inferInsert;