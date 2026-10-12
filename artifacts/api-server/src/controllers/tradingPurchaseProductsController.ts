import type { Request, Response } from "express";
import * as service from "../services/tradingPurchaseProductsService";
import { deleteUpload } from "../utils/uploadHelper";

// ─── Helper: extract numeric user ID ──────────────────────────────────────────
function getUserId(req: Request): number {
  const u = (req as any).user;
  const id = Number(u?.id ?? u?.userId ?? u?.sub ?? 0);
  return isNaN(id) ? 0 : id;
}

// ─── Helper: parse multipart JSON fields ──────────────────────────────────────
function parseMultipartBody(body: Record<string, unknown>) {
  const parsed = { ...body };

  if (typeof parsed.items === "string") {
    try { parsed.items = JSON.parse(parsed.items); } catch { parsed.items = []; }
  }
  if (typeof parsed.existingAttachments === "string") {
    try { parsed.existingAttachments = JSON.parse(parsed.existingAttachments); } catch { parsed.existingAttachments = []; }
  }
  if (typeof parsed.vendor_id === "string") parsed.vendor_id = Number(parsed.vendor_id);
  if (typeof parsed.paid_amount === "string") parsed.paid_amount = Number(parsed.paid_amount);
  if (typeof parsed.discount === "string") parsed.discount = Number(parsed.discount);
  if (typeof parsed.freight === "string") parsed.freight = Number(parsed.freight);
  if (typeof parsed.other_charges === "string") parsed.other_charges = Number(parsed.other_charges);
  if (typeof parsed.transportation === "string") parsed.transportation = Number(parsed.transportation);
  if (typeof parsed.insurance === "string") parsed.insurance = Number(parsed.insurance);

  return parsed;
}

// ─── Helper: assemble final attachments array (existing + newly uploaded) ────
async function assembleAttachments(
  existingAttachments: Array<{ imagePath: string; originalName?: string; mimeType?: string; fileSize?: number }> = [],
  files: Express.Multer.File[] = [],
  purchaseIdentifier: string | number
) {
  const uploaded = await Promise.all(
    files.map(file =>
      service.uploadPurchaseAttachment(file, purchaseIdentifier).then(url => ({
        imagePath: url,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      }))
    )
  );
  return [...existingAttachments, ...uploaded];
}

// ─── List ─────────────────────────────────────────────────────────────────────
export async function getTradingPurchases(req: Request, res: Response) {
  try {
    const search = String(req.query.search ?? "");
    const status = (req.query.status as "all" | "active" | "inactive") ?? "all";
    const vendorId = req.query.vendorId ? Number(req.query.vendorId) : undefined;
    const paymentStatus = req.query.paymentStatus ? String(req.query.paymentStatus) : undefined;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 10)));

    const result = await service.listTradingPurchases({
      search, status, vendorId, paymentStatus, page, limit,
    });
    res.json(result);
  } catch (err) {
    console.error("getTradingPurchases error:", err);
    res.status(500).json({ message: "Failed to fetch purchases" });
  }
}

// ─── Get By ID ────────────────────────────────────────────────────────────────
export async function getTradingPurchaseById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid purchase ID" });

    const purchase = await service.getTradingPurchaseById(id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    res.json(purchase);
  } catch (err) {
    console.error("getTradingPurchaseById error:", err);
    res.status(500).json({ message: "Failed to fetch purchase" });
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────
export async function createTradingPurchase(req: Request, res: Response) {
  const uploadedPaths: string[] = [];
  try {
    const body = parseMultipartBody(req.body);
    const parsed = service.insertTradingPurchaseSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const createdBy = getUserId(req);
    if (!createdBy) return res.status(401).json({ message: "Unauthorized" });

    const files = (req.files as Express.Multer.File[]) ?? [];

    // Pre-generate purchase number so files land in a deterministic folder
    const purchaseNumber = parsed.data.purchase_number
      || (await service.generatePurchaseNumber());

    const attachments = await assembleAttachments([], files, purchaseNumber);
    attachments.forEach(a => uploadedPaths.push(a.imagePath));

    const purchase = await service.createTradingPurchase(
      { ...parsed.data, purchase_number: purchaseNumber, attachments },
      createdBy
    );

    res.status(201).json(purchase);
  } catch (err) {
    await Promise.all(uploadedPaths.map(p => deleteUpload(p).catch(() => undefined)));
    console.error("createTradingPurchase error:", err);
    res.status(500).json({ message: "Failed to create purchase" });
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────
export async function updateTradingPurchase(req: Request, res: Response) {
  const uploadedPaths: string[] = [];
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid purchase ID" });

    const body = parseMultipartBody(req.body);
    const parsed = service.updateTradingPurchaseSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const updatedBy = getUserId(req);
    if (!updatedBy) return res.status(401).json({ message: "Unauthorized" });

    const files = (req.files as Express.Multer.File[]) ?? [];
    const existingAttachments = Array.isArray(body.existingAttachments)
      ? (body.existingAttachments as Array<{ imagePath: string; originalName?: string; mimeType?: string; fileSize?: number }>)
      : [];

    const attachments = await assembleAttachments(existingAttachments, files, id);
    uploadedPaths.push(...attachments.slice(existingAttachments.length).map(a => a.imagePath));

    const purchase = await service.updateTradingPurchase(
      id,
      { ...parsed.data, attachments },
      updatedBy
    );
    if (!purchase) {
      await Promise.all(uploadedPaths.map(p => deleteUpload(p).catch(() => undefined)));
      return res.status(404).json({ message: "Purchase not found" });
    }

    res.json(purchase);
  } catch (err) {
    await Promise.all(uploadedPaths.map(p => deleteUpload(p).catch(() => undefined)));
    console.error("updateTradingPurchase error:", err);
    res.status(500).json({ message: "Failed to update purchase" });
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────
export async function deleteTradingPurchase(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid purchase ID" });

    const deletedBy = getUserId(req);
    if (!deletedBy) return res.status(401).json({ message: "Unauthorized" });

    const purchase = await service.deleteTradingPurchase(id, deletedBy);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    res.json({ message: "Purchase deleted successfully" });
  } catch (err) {
    console.error("deleteTradingPurchase error:", err);
    res.status(500).json({ message: "Failed to delete purchase" });
  }
}