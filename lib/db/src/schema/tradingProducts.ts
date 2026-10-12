import { pgTable, serial, varchar, text, integer, boolean, timestamp, index, } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./users";

// ─── Trading Products ─────────────────────────────────────────────────────────
export const tradingProducts = pgTable("trading_products", {
  id: serial("id").primaryKey(),
  productCode: varchar("product_code", { length: 50 }).notNull().unique(),
  productName: varchar("product_name", { length: 200 }).notNull(),
  category: integer("category_id").notNull(),
  description: text("description"),
  hsnCode: varchar("hsn_code", { length: 20 }),
  gstPercentage: varchar("gst_percentage", { length: 10 }),
  isActive: boolean("is_active").notNull().default(true),

  // ── Variant flags (fast, no join needed) ──
  hasColors: boolean("has_colors").notNull().default(false),
  hasSizes: boolean("has_sizes").notNull().default(false),

  // ── Soft delete + audit ──
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedBy: integer("deleted_by").references(() => usersTable.id),
  deletedAt: timestamp("deleted_at"),
  createdBy: integer("created_by").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => usersTable.id),
  updatedAt: timestamp("updated_at"),
}, (table) => ({
  productCodeIdx: index("trading_products_code_idx").on(table.productCode),
  productNameIdx: index("trading_products_name_idx").on(table.productName),
  categoryIdx: index("trading_products_category_idx").on(table.category),
  isActiveIdx: index("trading_products_is_active_idx").on(table.isActive),
  hasColorsIdx: index("trading_products_has_colors_idx").on(table.hasColors),
  hasSizesIdx: index("trading_products_has_sizes_idx").on(table.hasSizes),
}));

// ─── Trading Product Colors ───────────────────────────────────────────────────
export const tradingProductColors = pgTable("trading_product_colors", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => tradingProducts.id, { onDelete: "cascade" }),
  colorName: varchar("color_name", { length: 100 }).notNull(),
  hexCode: varchar("hex_code", { length: 10 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  productIdIdx: index("tpc_product_id_idx").on(table.productId),
  colorNameIdx: index("tpc_color_name_idx").on(table.colorName),
}));

// ─── Trading Product Sizes ────────────────────────────────────────────────────
export const tradingProductSizes = pgTable("trading_product_sizes", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => tradingProducts.id, { onDelete: "cascade" }),
  sizeLabel: varchar("size_label", { length: 20 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  productIdIdx: index("tps_product_id_idx").on(table.productId),
  sizeLabelIdx: index("tps_size_label_idx").on(table.sizeLabel),
}));

// ─── Keep existing image table ────────────────────────────────────────────────
export const tradingProductImages = pgTable("trading_product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => tradingProducts.id, { onDelete: "cascade" }),
  imagePath: varchar("image_path", { length: 500 }).notNull(),
  originalName: varchar("original_name", { length: 255 }),
  isPrimary: boolean("is_primary").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdBy: integer("created_by").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  productIdIdx: index("trading_product_images_product_id_idx").on(table.productId),
}));

// ─── Types ────────────────────────────────────────────────────────────────────
export type TradingProduct = typeof tradingProducts.$inferSelect;
export type NewTradingProduct = typeof tradingProducts.$inferInsert;
export type TradingProductColor = typeof tradingProductColors.$inferSelect;
export type NewTradingProductColor = typeof tradingProductColors.$inferInsert;
export type TradingProductSize = typeof tradingProductSizes.$inferSelect;
export type NewTradingProductSize = typeof tradingProductSizes.$inferInsert;
export type TradingProductImage = typeof tradingProductImages.$inferSelect;
export type NewTradingProductImage = typeof tradingProductImages.$inferInsert;

// ─── Zod Validation ───────────────────────────────────────────────────────────
export const insertTradingProductSchema = z.object({
  productCode: z.string().min(1).max(50).optional(),
  productName: z.string().min(1, "Product Name is required").max(200),
  category: z.number().int().positive("Category is required"),
  description: z.string().max(500).optional().nullable(),
  hsnCode: z.string().max(20).optional().nullable(),
  gstPercentage: z.string().max(10).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true),
  hasColors: z.boolean().default(false),
  colors: z.array(z.object({
    colorName: z.string().min(1).max(100),
    hexCode: z.string().min(4).max(10),
  })).default([]),
  hasSizes: z.boolean().default(false),
  sizes: z.array(z.string().min(1).max(20)).default([]),
});

export const updateTradingProductSchema = insertTradingProductSchema.partial().extend({
  images: z.array(z.object({
    imagePath: z.string(),
    originalName: z.string().optional(),
  })).optional(),
});

export type InsertTradingProduct = z.infer<typeof insertTradingProductSchema>;
export type UpdateTradingProduct = z.infer<typeof updateTradingProductSchema>;