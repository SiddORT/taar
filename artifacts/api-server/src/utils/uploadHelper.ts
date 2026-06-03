/**
 * uploadHelper — Storage-driver-agnostic file upload utility.
 *
 * Usage in routes:
 *
 *   import { uploadMiddleware, uploadFile, deleteUpload } from "../utils/uploadHelper";
 *
 *   router.post("/my-route", requireAuth, uploadMiddleware.single("file"), async (req, res) => {
 *     const path = await uploadFile(req.file!, {
 *       entity: "orders",
 *       id: orderId,
 *       category: "artwork",
 *     });
 *     // path = "/uploads/orders/<orderId>/artwork/<timestamp>_<filename>"
 *   });
 *
 * Switching to S3 later:
 *   Set STORAGE_PROVIDER=s3 in environment — no route changes needed.
 */

import path from "path";
import crypto from "crypto";
import multer from "multer";
import { storage } from "../storage";

// ─── Multer shared middleware ──────────────────────────────────────────────────
// Uses memory storage so the helper controls where files are written.

const ALLOWED_MIMES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MEDIA_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",
];

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, PNG, or WebP files are allowed"));
    }
  },
});

/** Separate middleware for WIP/Final media uploads — allows images and videos up to 200 MB */
export const mediaUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (MEDIA_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image (JPG, PNG, WebP) or video (MP4, MOV, WebM) files are allowed"));
    }
  },
});

// ─── Upload options ────────────────────────────────────────────────────────────

export interface UploadOptions {
  /** Top-level folder: "procurement" | "expenses" | "packing-lists" | "orders" | "materials" | "fabrics" */
  entity: string;
  /** Entity identifier (PR id, expense number, order id, etc.) */
  id?: string | number;
  /** Sub-folder within entity: "invoices" | "artwork" | "wip" | "final" | "pattern" | "toile" | "images" */
  category?: string;
}

// ─── Path builders ─────────────────────────────────────────────────────────────

function buildTargetDir(opts: UploadOptions): string {
  const parts: string[] = [process.cwd(), "uploads", opts.entity];
  if (opts.id != null) {
    parts.push(String(opts.id).replace(/\//g, "-").replace(/\s/g, "_"));
  }
  if (opts.category) {
    parts.push(opts.category);
  }
  return path.join(...parts);
}

function buildRelativeUrl(dir: string, filename: string): string {
  const rel = dir.replace(process.cwd(), "").replace(/\\/g, "/");
  return `${rel}/${filename}`;
}

/**
 * Resolve a stored URL or relative path back to an absolute filesystem path.
 * Handles both legacy formats and new `/uploads/...` URLs.
 *
 * Legacy packing-list images: "/api/packing-lists/item-images/<filename>"
 * New format:                  "/uploads/packing-lists/<id>/images/<filename>"
 */
export function resolveUploadAbsPath(urlOrPath: string): string {
  if (!urlOrPath) return "";

  // Legacy packing-list image URL
  if (urlOrPath.startsWith("/api/packing-lists/item-images/")) {
    const filename = path.basename(urlOrPath);
    return path.join(process.cwd(), "uploads", "packing-list-items", filename);
  }

  // New /uploads/... URL or relative path starting with /uploads/
  if (urlOrPath.startsWith("/uploads/")) {
    return path.join(process.cwd(), urlOrPath.slice(1));
  }

  // Already an absolute path
  if (path.isAbsolute(urlOrPath)) return urlOrPath;

  // Fallback — treat as relative to cwd
  return path.join(process.cwd(), urlOrPath);
}

// ─── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Save an uploaded file to the configured storage backend.
 * Returns the relative URL used to access the file (e.g. "/uploads/orders/123/artwork/...").
 */
export async function uploadFile(
  file: Express.Multer.File,
  opts: UploadOptions
): Promise<string> {
  const ext = path.extname(file.originalname) || "";
  const uid = crypto.randomBytes(8).toString("hex");
  const baseName = path.basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 60);
  const filename = `${uid}_${baseName}${ext}`;

  const dir = buildTargetDir(opts);
  await storage.saveFile(file.buffer, { dir, filename });
  return buildRelativeUrl(dir, filename);
}

/**
 * Delete a previously uploaded file from the configured storage backend.
 * Accepts either a relative URL ("/uploads/...") or an absolute path.
 * No-ops silently if the file does not exist.
 */
export async function deleteUpload(urlOrPath: string): Promise<void> {
  if (!urlOrPath) return;
  const absPath = resolveUploadAbsPath(urlOrPath);
  await storage.deleteFile(absPath);
}

// ─── Base64 data-URI → disk conversion ───────────────────────────────────────
// Master/payment forms still submit images as base64 data URIs inside the JSON
// body. These helpers decode that base64, write the bytes to the configured
// storage backend, and return a `/uploads/...` URL so the DB only stores paths.
// Entries that already carry a `url` are passed through unchanged (e.g. on edit).

const DATA_URI_RE = /^data:([^;]+);base64,(.+)$/s;

/** Max decoded size for a single base64 data-URI persisted to disk (20 MB). */
const MAX_DATA_URI_BYTES = 20 * 1024 * 1024;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
};

/**
 * Persist a base64 data-URI to storage. Returns the relative URL and decoded
 * byte size, or null when the string is not a data URI.
 */
export async function persistDataUri(
  dataUri: string,
  originalName: string,
  opts: UploadOptions
): Promise<{ url: string; size: number } | null> {
  const m = DATA_URI_RE.exec(dataUri);
  if (!m) return null;
  const mime = m[1].toLowerCase();
  if (!(mime in MIME_EXT)) return null;
  const buffer = Buffer.from(m[2], "base64");
  if (buffer.length === 0 || buffer.length > MAX_DATA_URI_BYTES) return null;
  const uid = crypto.randomBytes(8).toString("hex");
  const safe = (originalName || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 60);
  const existingExt = path.extname(safe);
  const ext = existingExt || MIME_EXT[mime] || "";
  const nameNoExt = existingExt ? path.basename(safe, existingExt) : safe;
  const filename = `${uid}_${nameNoExt}${ext}`;
  const dir = buildTargetDir(opts);
  await storage.saveFile(buffer, { dir, filename });
  return { url: buildRelativeUrl(dir, filename), size: buffer.length };
}

export interface StoredImage {
  id: string;
  name: string;
  url: string;
  size: number;
}

export interface StoredAttachment {
  name: string;
  type: string;
  url: string;
  size: number;
}

/**
 * Convert an images array so any base64 `data` entries are written to disk and
 * replaced with a `url`. Already-stored entries (with a `url`) pass through.
 */
export async function persistImageArray(
  items: unknown,
  opts: UploadOptions
): Promise<StoredImage[]> {
  if (!Array.isArray(items)) return [];
  const out: StoredImage[] = [];
  for (const raw of items) {
    const it = raw as { id?: string; name?: string; data?: string; url?: string; size?: number };
    if (typeof it?.url === "string" && it.url && !it.url.startsWith("data:")) {
      out.push({ id: it.id ?? crypto.randomUUID(), name: it.name ?? "image", url: it.url, size: it.size ?? 0 });
    } else if (typeof it?.data === "string" && it.data.startsWith("data:")) {
      const saved = await persistDataUri(it.data, it.name ?? "image", opts);
      if (saved) out.push({ id: it.id ?? crypto.randomUUID(), name: it.name ?? "image", url: saved.url, size: saved.size });
    }
  }
  return out;
}

/** Same as persistImageArray but for {name,type,url,size} payment attachments. */
export async function persistAttachmentArray(
  items: unknown,
  opts: UploadOptions
): Promise<StoredAttachment[]> {
  if (!Array.isArray(items)) return [];
  const out: StoredAttachment[] = [];
  for (const raw of items) {
    const it = raw as { name?: string; type?: string; data?: string; url?: string; size?: number };
    if (typeof it?.url === "string" && it.url && !it.url.startsWith("data:")) {
      out.push({ name: it.name ?? "file", type: it.type ?? "", url: it.url, size: it.size ?? 0 });
    } else if (typeof it?.data === "string" && it.data.startsWith("data:")) {
      const saved = await persistDataUri(it.data, it.name ?? "file", opts);
      if (saved) out.push({ name: it.name ?? "file", type: it.type ?? "", url: saved.url, size: saved.size });
    }
  }
  return out;
}

/** Single-attachment variant (e.g. pr_payments.attachment). */
export async function persistAttachmentObject(
  item: unknown,
  opts: UploadOptions
): Promise<StoredAttachment | null> {
  if (!item || typeof item !== "object") return null;
  const [first] = await persistAttachmentArray([item], opts);
  return first ?? null;
}
