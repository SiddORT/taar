import { db, eq, and, ilike, sql, desc, inArray } from "@workspace/db";
import {
  tradingPurchaseProduct,
  purchaseProductItems,
  tradingPurchaseProductImages,
  vendors,
  tradingProducts,
  usersTable,
  insertTradingPurchaseSchema,
  updateTradingPurchaseSchema,
  type InsertTradingPurchase,
  type UpdateTradingPurchase,
} from "@workspace/db";
import { uploadFile, deleteUpload, type UploadOptions } from "../utils/uploadHelper";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────
const decimalString = z
  .union([z.string(), z.number()])
  .transform((v) => String(v))
  .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
    message: "Must be a non-negative number",
  });

export const purchaseItemSchema = z.object({
  product_id: z.union([z.string(), z.number()]).transform(String),
  size: z.string().max(20).optional().nullable(),
  quantity: decimalString,
  rate: decimalString,
  hsn_code: z.string().min(1).max(20),
  gst_percentage: decimalString,
  gst_amount: decimalString.optional(),
  amount: decimalString.optional(),
});

export const insertTradingPurchaseSchema = z.object({
  purchase_number: z.string().min(1).max(50).optional(),
  purchase_date: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  vendor_id: z.coerce.number().int().positive(),
  vendor_invoice_number: z.string().max(100).optional().nullable(),
  supplier_po_number: z.string().max(100).optional().nullable(),
  payment_terms: z.string().max(50).optional().nullable(),
  due_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  items: z.array(purchaseItemSchema).min(1, "At least one item required"),

  freight: decimalString.default("0"),
  other_charges: decimalString.default("0"),
  transportation: decimalString.default("0"),
  insurance: decimalString.default("0"),
  discount: decimalString.default("0"),
  remarks: z.string().optional().nullable(),

  paid_amount: decimalString.default("0"),
  payment_status: z.enum(["Pending", "Partial", "Paid"]).default("Pending"),
});

export const updateTradingPurchaseSchema = insertTradingPurchaseSchema.partial();

// ─── Types ────────────────────────────────────────────────────────────────────
type PurchaseAttachment = {
  imagePath: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
};

type PurchaseWithAttachments = InsertTradingPurchaseProduct & {
  attachments?: PurchaseAttachment[];
};

// ─── Generate Purchase Number ─────────────────────────────────────────────────
export async function generatePurchaseNumber(): Promise<string> {
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, "0")}${String(today.getMonth() + 1).padStart(2, "0")}${today.getFullYear()}`;
  const prefix = `PUR-${dateStr}-`;

  const last = await db
    .select({ purchaseNumber: tradingPurchaseProduct.purchaseNumber })
    .from(tradingPurchaseProduct)
    .where(ilike(tradingPurchaseProduct.purchaseNumber, `${prefix}%`))
    .orderBy(desc(tradingPurchaseProduct.purchaseNumber))
    .limit(1);

  const nextNum = last.length > 0
    ? parseInt(last[0].purchaseNumber.split("-").pop() || "0", 10) + 1
    : 1;

  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}

// ─── Recompute Totals ─────────────────────────────────────────────────────────
function computeTotals(items: Array<{
  quantity: string; rate: string; gst_percentage: string;
}>, charges: { freight: string; other_charges: string; transportation: string; insurance: string; discount: string }, paidAmount: string) {
  let subtotal = 0;
  let totalGst = 0;

  const processedItems = items.map((i) => {
    const qty = parseFloat(i.quantity) || 0;
    const rate = parseFloat(i.rate) || 0;
    const gstPct = parseFloat(i.gst_percentage) || 0;

    const gross = qty * rate;
    const gstAmt = +(gross * (gstPct / 100)).toFixed(2);
    const lineTotal = +(gross + gstAmt).toFixed(2);

    subtotal += gross;
    totalGst += gstAmt;

    return { gross, gstAmt, lineTotal };
  });

  subtotal = +subtotal.toFixed(2);
  totalGst = +totalGst.toFixed(2);

  const otherCharges =
    (parseFloat(charges.freight) || 0) +
    (parseFloat(charges.other_charges) || 0) +
    (parseFloat(charges.transportation) || 0) +
    (parseFloat(charges.insurance) || 0);

  const discount = parseFloat(charges.discount) || 0;
  const taxableAmount = +(subtotal - discount).toFixed(2);
  const grandTotal = +(taxableAmount + totalGst + otherCharges).toFixed(2);
  const paid = parseFloat(paidAmount) || 0;
  const balanceAmount = +(grandTotal - paid).toFixed(2);

  return {
    processedItems,
    subtotal,
    totalGst,
    otherCharges: +otherCharges.toFixed(2),
    taxableAmount,
    grandTotal,
    paidAmount: paid,
    balanceAmount,
  };
}

// ─── Load user summaries ──────────────────────────────────────────────────────
async function loadUsers(ids: (number | null | undefined)[]) {
  const validIds = [...new Set(ids.filter((id): id is number => id != null))];
  if (validIds.length === 0) return new Map();

  const rows = await db
    .select({ id: usersTable.id, username: usersTable.username, email: usersTable.email })
    .from(usersTable)
    .where(inArray(usersTable.id, validIds));

  return new Map(rows.map(u => [u.id, u]));
}

// ─── Upload Attachment ────────────────────────────────────────────────────────
export async function uploadPurchaseAttachment(
  file: Express.Multer.File,
  purchaseIdentifier: number | string
): Promise<string> {
  const opts: UploadOptions = {
    entity: "trading-purchases",
    id: purchaseIdentifier,
    category: "attachments",
  };
  return await uploadFile(file, opts);
}

// ─── List ─────────────────────────────────────────────────────────────────────
export async function listTradingPurchases(params: {
  search: string;
  status: "all" | "active" | "inactive";
  vendorId?: number;
  paymentStatus?: string;
  page: number;
  limit: number;
}) {
  const { search, status, vendorId, paymentStatus, page, limit } = params;
  const offset = (page - 1) * limit;

  const conditions = [eq(tradingPurchaseProduct.isDeleted, false)];

  if (search) {
    conditions.push(
      sql`(${tradingPurchaseProduct.purchaseNumber} ILIKE ${"%" + search + "%"}
        OR ${tradingPurchaseProduct.vendorInvoiceNumber} ILIKE ${"%" + search + "%"}
        OR ${tradingPurchaseProduct.supplierPoNumber} ILIKE ${"%" + search + "%"})`
    );
  }
  if (status === "active") conditions.push(eq(tradingPurchaseProduct.isDeleted, false));
  if (status === "inactive") conditions.push(eq(tradingPurchaseProduct.isDeleted, true));
  if (vendorId) conditions.push(eq(tradingPurchaseProduct.vendorId, vendorId));
  if (paymentStatus) conditions.push(eq(tradingPurchaseProduct.paymentStatus, paymentStatus));

  const where = and(...conditions);

  const [rows, countResult] = await Promise.all([
    db.select().from(tradingPurchaseProduct).where(where).limit(limit).offset(offset).orderBy(desc(tradingPurchaseProduct.createdAt)),
    db.select({ count: sql<number>`count(*)` }).from(tradingPurchaseProduct).where(where),
  ]);

  if (rows.length === 0) {
    return { data: [], total: 0, page, limit };
  }

  const purchaseIds = rows.map(r => r.id);
  const vendorIds = [...new Set(rows.map(r => r.vendorId))];

  const [vendorRows, items, images, userMap] = await Promise.all([
    db.select().from(vendors).where(inArray(vendors.id, vendorIds)),
    db.select().from(purchaseProductItems).where(inArray(purchaseProductItems.purchaseId, purchaseIds)),
    db.select().from(tradingPurchaseProductImages).where(inArray(tradingPurchaseProductImages.tradingPurchaseProductId, purchaseIds)),
    loadUsers(rows.flatMap(r => [r.createdBy, r.updatedBy])),
  ]);

  const vendorMap = new Map(vendorRows.map(v => [v.id, v]));
  const itemMap = new Map<number, typeof items>();
  items.forEach(i => {
    if (!itemMap.has(i.purchaseId)) itemMap.set(i.purchaseId, []);
    itemMap.get(i.purchaseId)!.push(i);
  });
  const imageMap = new Map<number, typeof images>();
  images.forEach(img => {
    if (!imageMap.has(img.tradingPurchaseProductId)) imageMap.set(img.tradingPurchaseProductId, []);
    imageMap.get(img.tradingPurchaseProductId)!.push(img);
  });

  const data = rows.map(r => ({
    ...r,
    vendor: vendorMap.get(r.vendorId) ?? null,
    items: itemMap.get(r.id) ?? [],
    attachments: (imageMap.get(r.id) ?? []).sort((a, b) => a.displayOrder - b.displayOrder),
    createdByUser: userMap.get(r.createdBy) ?? null,
    updatedByUser: r.updatedBy ? userMap.get(r.updatedBy) ?? null : null,
  }));

  return { data, total: Number(countResult[0]?.count ?? 0), page, limit };
}

// ─── Get By ID ────────────────────────────────────────────────────────────────
export async function getTradingPurchaseById(id: number) {
  const [purchase] = await db
    .select()
    .from(tradingPurchaseProduct)
    .where(and(eq(tradingPurchaseProduct.id, id), eq(tradingPurchaseProduct.isDeleted, false)))
    .limit(1);

  if (!purchase) return null;

  const [vendorRow, items, images, userMap] = await Promise.all([
    db.select().from(vendors).where(eq(vendors.id, purchase.vendorId)).limit(1),
    db.select().from(purchaseProductItems).where(eq(purchaseProductItems.purchaseId, id)),
    db.select().from(tradingPurchaseProductImages).where(eq(tradingPurchaseProductImages.tradingPurchaseProductId, id)),
    loadUsers([purchase.createdBy, purchase.updatedBy]),
  ]);

  return {
    ...purchase,
    vendor: vendorRow[0] ?? null,
    items,
    attachments: images.sort((a, b) => a.displayOrder - b.displayOrder),
    createdByUser: userMap.get(purchase.createdBy) ?? null,
    updatedByUser: purchase.updatedBy ? userMap.get(purchase.updatedBy) ?? null : null,
  };
}

// ─── Create ───────────────────────────────────────────────────────────────────
export async function createTradingPurchase(
  input: PurchaseWithAttachments,
  createdBy: number
) {
  const purchaseNumber = input.purchaseNumber || (await generatePurchaseNumber());

  const totals = computeTotals(
    input.items.map(i => ({
      quantity: String(i.quantity),
      rate: String(i.rate),
      gst_percentage: String(i.gstPercentage),
    })),
    {
      freight: String(input.freight ?? "0"),
      other_charges: String(input.otherCharges ?? "0"),
      transportation: String(input.transportation ?? "0"),
      insurance: String(input.insurance ?? "0"),
      discount: String(input.discount ?? "0"),
    },
    String(input.paidAmount ?? "0")
  );

  return await db.transaction(async (tx) => {
    const [purchase] = await tx
      .insert(tradingPurchaseProduct)
      .values({
        purchaseNumber,
        purchaseDate: new Date(input.purchaseDate),
        vendorId: input.vendorId,
        vendorInvoiceNumber: input.vendorInvoiceNumber ?? null,
        supplierPoNumber: input.supplierPoNumber ?? null,
        paymentTerms: input.paymentTerms ?? null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        notes: input.notes ?? null,

        freight: String(input.freight ?? "0"),
        otherCharges: String(input.otherCharges ?? "0"),
        transportation: String(input.transportation ?? "0"),
        insurance: String(input.insurance ?? "0"),
        discount: String(input.discount ?? "0"),
        remarks: input.remarks ?? null,

        subtotal: totals.subtotal.toFixed(2),
        totalGstAmount: totals.totalGst.toFixed(2),
        taxableAmount: totals.taxableAmount.toFixed(2),
        grandTotal: totals.grandTotal.toFixed(2),

        paidAmount: totals.paidAmount.toFixed(2),
        balanceAmount: totals.balanceAmount.toFixed(2),
        paymentStatus: input.paymentStatus ?? "Pending",

        createdBy,
      })
      .returning();

    if (input.items.length > 0) {
      await tx.insert(purchaseProductItems).values(
        input.items.map((i, idx) => ({
          purchaseId: purchase.id,
          productId: Number(i.productId),
          size: i.size ?? null,
          quantity: String(i.quantity),
          rate: String(i.rate),
          hsnCode: String(i.hsnCode),
          gstPercentage: String(i.gstPercentage),
          gstAmount: totals.processedItems[idx].gstAmt.toFixed(2),
          amount: totals.processedItems[idx].lineTotal.toFixed(2),
        }))
      );
    }

    if (input.attachments && input.attachments.length > 0) {
      await tx.insert(tradingPurchaseProductImages).values(
        input.attachments.map((a, idx) => ({
          tradingPurchaseProductId: purchase.id,
          imagePath: a.imagePath,
          originalName: a.originalName ?? "attachment",
          mimeType: a.mimeType ?? "application/octet-stream",
          fileSize: a.fileSize ?? 0,
          displayOrder: idx,
          uploadedBy: createdBy,
        }))
      );
    }

    return purchase;
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────
export async function updateTradingPurchase(
  id: number,
  input: Partial<PurchaseWithAttachments>,
  updatedBy: number
) {
  // Load existing
  const [existing] = await db
    .select()
    .from(tradingPurchaseProduct)
    .where(eq(tradingPurchaseProduct.id, id))
    .limit(1);

  if (!existing) return null;

  const existingItems = await db
    .select()
    .from(purchaseProductItems)
    .where(eq(purchaseProductItems.purchaseId, id));

  const existingImages = await db
    .select()
    .from(tradingPurchaseProductImages)
    .where(eq(tradingPurchaseProductImages.tradingPurchaseProductId, id));

  // Merge with incoming
  const itemsForCalc = input.items && input.items.length > 0
    ? input.items
    : existingItems.map(i => ({
        productId: String(i.productId),
        size: i.size ?? undefined,
        quantity: i.quantity,
        rate: i.rate,
        hsnCode: i.hsnCode,
        gstPercentage: i.gstPercentage,
      }));

  const totals = computeTotals(
    itemsForCalc.map(i => ({
      quantity: String(i.quantity),
      rate: String(i.rate),
      gst_percentage: String(i.gstPercentage),
    })),
    {
      freight: String(input.freight ?? existing.freight),
      other_charges: String(input.otherCharges ?? existing.otherCharges),
      transportation: String(input.transportation ?? existing.transportation),
      insurance: String(input.insurance ?? existing.insurance),
      discount: String(input.discount ?? existing.discount),
    },
    String(input.paidAmount ?? existing.paidAmount)
  );

  // Which attachments will be deleted?
  let removedAttachmentPaths: string[] = [];
  if (input.attachments !== undefined) {
    const newPaths = new Set(input.attachments.map(a => a.imagePath));
    removedAttachmentPaths = existingImages
      .filter(img => !newPaths.has(img.imagePath))
      .map(img => img.imagePath);
  }

  const updated = await db.transaction(async (tx) => {
    const [purchase] = await tx
      .update(tradingPurchaseProduct)
      .set({
        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : existing.purchaseDate,
        vendorId: input.vendorId ?? existing.vendorId,
        vendorInvoiceNumber: input.vendorInvoiceNumber !== undefined ? input.vendorInvoiceNumber : existing.vendorInvoiceNumber,
        supplierPoNumber: input.supplierPoNumber !== undefined ? input.supplierPoNumber : existing.supplierPoNumber,
        paymentTerms: input.paymentTerms !== undefined ? input.paymentTerms : existing.paymentTerms,
        dueDate: input.dueDate !== undefined ? (input.dueDate ? new Date(input.dueDate) : null) : existing.dueDate,
        notes: input.notes !== undefined ? input.notes : existing.notes,

        freight: String(input.freight ?? existing.freight),
        otherCharges: String(input.otherCharges ?? existing.otherCharges),
        transportation: String(input.transportation ?? existing.transportation),
        insurance: String(input.insurance ?? existing.insurance),
        discount: String(input.discount ?? existing.discount),
        remarks: input.remarks !== undefined ? input.remarks : existing.remarks,

        subtotal: totals.subtotal.toFixed(2),
        totalGstAmount: totals.totalGst.toFixed(2),
        taxableAmount: totals.taxableAmount.toFixed(2),
        grandTotal: totals.grandTotal.toFixed(2),

        paidAmount: totals.paidAmount.toFixed(2),
        balanceAmount: totals.balanceAmount.toFixed(2),
        paymentStatus: input.paymentStatus ?? existing.paymentStatus,

        updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(tradingPurchaseProduct.id, id))
      .returning();

    if (!purchase) return null;

    // Replace items only if the client sent items
    if (input.items !== undefined) {
      await tx.delete(purchaseProductItems).where(eq(purchaseProductItems.purchaseId, id));
      if (input.items.length > 0) {
        await tx.insert(purchaseProductItems).values(
          input.items.map((i, idx) => ({
            purchaseId: id,
            productId: Number(i.productId),
            size: i.size ?? null,
            quantity: String(i.quantity),
            rate: String(i.rate),
            hsnCode: String(i.hsnCode),
            gstPercentage: String(i.gstPercentage),
            gstAmount: totals.processedItems[idx].gstAmt.toFixed(2),
            amount: totals.processedItems[idx].lineTotal.toFixed(2),
          }))
        );
      }
    }

    // Replace attachments only if the client sent attachments
    if (input.attachments !== undefined) {
      await tx.delete(tradingPurchaseProductImages)
        .where(eq(tradingPurchaseProductImages.tradingPurchaseProductId, id));

      if (input.attachments.length > 0) {
        await tx.insert(tradingPurchaseProductImages).values(
          input.attachments.map((a, idx) => ({
            tradingPurchaseProductId: id,
            imagePath: a.imagePath,
            originalName: a.originalName ?? "attachment",
            mimeType: a.mimeType ?? "application/octet-stream",
            fileSize: a.fileSize ?? 0,
            displayOrder: idx,
            uploadedBy: updatedBy,
          }))
        );
      }
    }

    return purchase;
  });

  if (!updated) return null;

  // Physically delete removed attachment files
  if (removedAttachmentPaths.length > 0) {
    await Promise.all(removedAttachmentPaths.map(p => deleteUpload(p).catch(() => undefined)));
  }

  return updated;
}

// ─── Delete (Soft) ────────────────────────────────────────────────────────────
export async function deleteTradingPurchase(id: number, deletedBy: number) {
  const existingImages = await db
    .select()
    .from(tradingPurchaseProductImages)
    .where(eq(tradingPurchaseProductImages.tradingPurchaseProductId, id));

  const deleted = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(tradingPurchaseProduct)
      .set({ isDeleted: true, deletedBy, deletedAt: new Date() })
      .where(eq(tradingPurchaseProduct.id, id))
      .returning();

    if (!row) return null;

    await tx.delete(purchaseProductItems).where(eq(purchaseProductItems.purchaseId, id));
    await tx.delete(tradingPurchaseProductImages)
      .where(eq(tradingPurchaseProductImages.tradingPurchaseProductId, id));

    return row;
  });

  if (deleted && existingImages.length > 0) {
    await Promise.all(existingImages.map(img => deleteUpload(img.imagePath).catch(() => undefined)));
  }

  return deleted;
}