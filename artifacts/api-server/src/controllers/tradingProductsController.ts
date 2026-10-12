import type { Request, Response } from "express";
import {
  insertTradingProductSchema,
  updateTradingProductSchema,
} from "@workspace/db";
import * as service from "../services/tradingProductsService";
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

  if (typeof parsed.tags === "string") {
    try { parsed.tags = JSON.parse(parsed.tags); } catch { parsed.tags = []; }
  }
  if (typeof parsed.existingImages === "string") {
    try { parsed.existingImages = JSON.parse(parsed.existingImages); } catch { parsed.existingImages = []; }
  }
  if (typeof parsed.colors === "string") {
    try { parsed.colors = JSON.parse(parsed.colors); } catch { parsed.colors = []; }
  }
  if (typeof parsed.sizes === "string") {
    try { parsed.sizes = JSON.parse(parsed.sizes); } catch { parsed.sizes = []; }
  }
  if (typeof parsed.category === "string") parsed.category = Number(parsed.category);
  if (typeof parsed.isActive === "string") {
    parsed.isActive = parsed.isActive === "true" || parsed.isActive === "Active";
  }
  if (typeof parsed.hasColors === "string") {
    parsed.hasColors = parsed.hasColors === "true";
  }
  if (typeof parsed.hasSizes === "string") {
    parsed.hasSizes = parsed.hasSizes === "true";
  }
  return parsed;
}

// ─── Helper: assemble final images array ──────────────────────────────────────
async function assembleImages(
  existingImages: Array<{ imagePath: string; originalName?: string }> = [],
  files: Express.Multer.File[] = [],
  productIdentifier: string | number
) {
  const uploaded = await Promise.all(
    files.map(file =>
      service.uploadProductImage(file, productIdentifier).then(url => ({
        imagePath: url,
        originalName: file.originalname,
      }))
    )
  );
  return [...existingImages, ...uploaded];
}

// ─── List ─────────────────────────────────────────────────────────────────────
export async function getTradingProducts(req: Request, res: Response) {
  try {
    const search = String(req.query.search ?? "");
    const status = (req.query.status as "all" | "active" | "inactive") ?? "all";
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const tag = req.query.tag ? String(req.query.tag) : undefined;
    const colorName = req.query.colorName ? String(req.query.colorName) : undefined;
    const sizeLabel = req.query.sizeLabel ? String(req.query.sizeLabel) : undefined;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 10)));

    const result = await service.listTradingProducts({
      search, status, categoryId, tag, colorName, sizeLabel, page, limit,
    });
    res.json(result);
  } catch (err) {
    console.error("getTradingProducts error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
}

// ─── Get By ID ────────────────────────────────────────────────────────────────
export async function getTradingProductById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });

    const product = await service.getTradingProductById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("getTradingProductById error:", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────
export async function createTradingProduct(req: Request, res: Response) {
  const uploadedPaths: string[] = [];
  try {
    const body = parseMultipartBody(req.body);
    const parsed = insertTradingProductSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const createdBy = getUserId(req);
    if (!createdBy) return res.status(401).json({ message: "Unauthorized" });

    const productCode = await service.generateProductCode();

    const files = (req.files as Express.Multer.File[]) ?? [];
    const images = await assembleImages(
      Array.isArray(body.existingImages) ? body.existingImages : [],
      files,
      productCode
    );
    images.forEach(i => uploadedPaths.push(i.imagePath));

    const product = await service.createTradingProduct(
      { ...parsed.data, productCode, images },
      createdBy
    );

    res.status(201).json(product);
  } catch (err) {
    await Promise.all(uploadedPaths.map(p => deleteUpload(p).catch(() => undefined)));
    console.error("createTradingProduct error:", err);
    res.status(500).json({ message: "Failed to create product" });
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────
export async function updateTradingProduct(req: Request, res: Response) {
  const uploadedPaths: string[] = [];
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });

    const body = parseMultipartBody(req.body);
    const parsed = updateTradingProductSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const updatedBy = getUserId(req);
    if (!updatedBy) return res.status(401).json({ message: "Unauthorized" });

    const files = (req.files as Express.Multer.File[]) ?? [];
    const images = await assembleImages(
      Array.isArray(body.existingImages) ? body.existingImages : [],
      files,
      id
    );
    uploadedPaths.push(...images.slice(
      Array.isArray(body.existingImages) ? body.existingImages.length : 0
    ).map(i => i.imagePath));

    const product = await service.updateTradingProduct(
      id,
      { ...parsed.data, images },
      updatedBy
    );
    if (!product) {
      await Promise.all(uploadedPaths.map(p => deleteUpload(p).catch(() => undefined)));
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    await Promise.all(uploadedPaths.map(p => deleteUpload(p).catch(() => undefined)));
    console.error("updateTradingProduct error:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
}

// ─── Toggle Status ────────────────────────────────────────────────────────────
export async function updateTradingProductStatus(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });

    const updatedBy = getUserId(req);
    if (!updatedBy) return res.status(401).json({ message: "Unauthorized" });

    const product = await service.toggleTradingProductStatus(id, updatedBy);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("updateTradingProductStatus error:", err);
    res.status(500).json({ message: "Failed to toggle status" });
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────
export async function deleteTradingProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });

    const deletedBy = getUserId(req);
    if (!deletedBy) return res.status(401).json({ message: "Unauthorized" });

    const product = await service.deleteTradingProduct(id, deletedBy);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("deleteTradingProduct error:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
}

// ─── Distinct Meta ────────────────────────────────────────────────────────────
export async function getProductColorOptions(req: Request, res: Response) {
  try {
    const colors = await service.getDistinctColors();
    res.json({ data: colors });
  } catch (err) {
    console.error("getProductColorOptions error:", err);
    res.status(500).json({ message: "Failed to fetch colors" });
  }
}

export async function getProductSizeOptions(req: Request, res: Response) {
  try {
    const sizes = await service.getDistinctSizes();
    res.json({ data: sizes });
  } catch (err) {
    console.error("getProductSizeOptions error:", err);
    res.status(500).json({ message: "Failed to fetch sizes" });
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────
export async function exportTradingProducts(req: Request, res: Response) {
  try {
    const search = String(req.query.search ?? "");
    const status = (req.query.status as "all" | "active" | "inactive") ?? "all";
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const colorName = req.query.colorName ? String(req.query.colorName) : undefined;
    const sizeLabel = req.query.sizeLabel ? String(req.query.sizeLabel) : undefined;

    const rows = await service.fetchAllTradingProductsForExport({
      search, status, categoryId, colorName, sizeLabel,
    });

    res.json({ data: rows });
  } catch (err) {
    console.error("exportTradingProducts error:", err);
    res.status(500).json({ message: "Failed to export products" });
  }
}

// ─── Import ───────────────────────────────────────────────────────────────────
export async function importTradingProducts(req: Request, res: Response) {
  try {
    const rows = Array.isArray(req.body) ? req.body : req.body?.rows;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "No data provided for import" });
    }

    const createdBy = getUserId(req);
    if (!createdBy) return res.status(401).json({ message: "Unauthorized" });

    const result = await service.importTradingProducts(rows, createdBy);
    res.json(result);
  } catch (err) {
    console.error("importTradingProducts error:", err);
    res.status(500).json({ message: "Failed to import products" });
  }
}