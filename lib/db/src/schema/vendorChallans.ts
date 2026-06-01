import { pgTable, serial, text, numeric, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export type ChallanAttachment = { url: string; originalName: string; mimeType?: string; size?: number };

export const vendorChallansTable = pgTable("vendor_challans", {
  id: serial("id").primaryKey(),
  challanNumber: text("challan_number").notNull().unique(),
  challanDate: text("challan_date").notNull(),
  vendorId: integer("vendor_id"),
  vendorName: text("vendor_name"),
  challanType: text("challan_type").notNull(),
  referenceOrderId: text("reference_order_id"),
  description: text("description"),
  quantity: numeric("quantity", { precision: 14, scale: 3 }),
  unit: text("unit"),
  rate: numeric("rate", { precision: 14, scale: 2 }),
  amount: numeric("amount", { precision: 14, scale: 2 }),
  attachment: jsonb("attachment"),
  attachments: jsonb("attachments").$type<ChallanAttachment[]>().default([]),
  lineItems: jsonb("line_items"),
  status: text("status").notNull().default("Draft"),
  linkedPoId: integer("linked_po_id"),
  linkedPoNumber: text("linked_po_number"),
  linkedPrId: integer("linked_pr_id"),
  linkedPrNumber: text("linked_pr_number"),
  remarks: text("remarks"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedBy: text("deleted_by"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type VendorChallanRecord = typeof vendorChallansTable.$inferSelect;

export const CHALLAN_TYPES = [
  "Material", "Artwork", "Outsource",
  "Toile Artisan", "Pattern Artisan", "Custom Artisan",
  "Packing", "Shipping", "Other Expense",
] as const;

export const CHALLAN_STATUSES = [
  "Draft", "Verified", "Converted to PO", "Converted to PR", "Billed", "Paid", "Cancelled",
] as const;

export const insertVendorChallanSchema = z.object({
  challanDate: z.string().min(1, "Challan date is required"),
  vendorId: z.number({ error: "Vendor is required" }).int().positive("Vendor is required"),
  vendorName: z.string().optional(),
  challanType: z.enum(CHALLAN_TYPES),
  referenceOrderId: z.string().optional(),
  description: z.string().optional(),
  quantity: z.union([z.string(), z.number()]).optional(),
  unit: z.string().optional(),
  rate: z.union([z.string(), z.number()]).optional(),
  amount: z.union([z.string(), z.number()]).optional(),
  attachment: z.any().optional(),
  attachments: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  lineItems: z.any().optional(),
  remarks: z.string().optional(),
});

export const updateVendorChallanSchema = insertVendorChallanSchema.partial();

export type InsertVendorChallan = z.infer<typeof insertVendorChallanSchema>;
export type UpdateVendorChallan = z.infer<typeof updateVendorChallanSchema>;
