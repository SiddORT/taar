import "dotenv/config";
import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { styleOrdersTable } from "@workspace/db";

// ============================================================
// CONFIGURATION
// ============================================================

const IMAGE_WIDTH = 600;
const IMAGE_HEIGHT = 600;
const JPEG_QUALITY = 90;

// Prefer Unsplash if available, fallback to Pexels
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "1971_WmEI7UsG3bESicWrMhPJGGrlnhGnZrbVsFzuzw";
const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";
const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";

const PHOTOS_PER_CATEGORY = 6; // candidates fetched per category search
const PHOTOS_NEEDED_PER_CATEGORY = 2; // wip/final/reference each need 2
const REQUEST_DELAY_MS = 1200;

type Category = "wip" | "final" | "reference";

// ============================================================
// VALIDATION
// ============================================================

if (!UNSPLASH_ACCESS_KEY && !PEXELS_API_KEY) {
  console.error("❌ Missing both UNSPLASH_ACCESS_KEY and PEXELS_API_KEY.");
  console.error("\nAdd at least one of these to your .env:");
  console.error(`
UNSPLASH_ACCESS_KEY=your_unsplash_key
PEXELS_API_KEY=your_pexels_key
`);
  process.exit(1);
}

// ============================================================
// TYPES
// ============================================================

interface StyleData {
  id: number;
  orderCode: string;
  styleName: string;
  styleNo: string | null;
  fabricType: string | null;
  season: string | null;
  colorway: string | null;
  description: string | null;
}

interface NormalizedPhoto {
  id: string;
  downloadUrl: string;
  photographer: string;
  source: "unsplash" | "pexels";
}

interface UnsplashPhoto {
  id: string;
  urls: { raw: string; full: string; regular: string };
  user: { name: string };
}

interface PexelsPhoto {
  id: number;
  src: { original: string; large2x: string; large: string; medium: string };
  photographer: string;
}

// ============================================================
// UTILITY
// ============================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// DATABASE
// ============================================================

async function getStyleOrders(): Promise<StyleData[]> {
  console.log("🔍 Fetching style orders from database...");
  const styles = await db
    .select({
      id: styleOrdersTable.id,
      orderCode: styleOrdersTable.orderCode,
      styleName: styleOrdersTable.styleName,
      styleNo: styleOrdersTable.styleNo,
      fabricType: styleOrdersTable.fabricType,
      season: styleOrdersTable.season,
      colorway: styleOrdersTable.colorway,
      description: styleOrdersTable.description,
    })
    .from(styleOrdersTable)
    .where(eq(styleOrdersTable.isDeleted, false));
  return styles;
}

// ============================================================
// BUILD SEARCH QUERIES
// ============================================================

/**
 * The "subject" is what the garment actually IS — e.g. "denim shirt".
 * This must lead the query. Fabric/colorway/season are secondary
 * descriptors, not the main subject, otherwise generic fabric
 * close-ups win the search instead of the actual garment.
 */
function buildSubjectQuery(data: StyleData): string {
  const parts: string[] = [];
  if (data.styleName) parts.push(data.styleName);
  if (data.description) parts.push(data.description);
  if (data.colorway) parts.push(data.colorway);
  if (data.fabricType) parts.push(data.fabricType);
  return parts.filter(Boolean).join(" ").trim();
}

/**
 * Each category gets a different framing on top of the same subject,
 * so wip/final/reference are genuinely different searches instead of
 * three random slices of one shared photo pool.
 */
function buildCategoryQuery(data: StyleData, category: Category): string {
  const subject = buildSubjectQuery(data) || "fashion garment";
  switch (category) {
    case "wip":
      // design/production-in-progress feel
      return `${subject} fashion design sketch flat lay process`;
    case "final":
      // clean finished product shot
      return `${subject} clothing product photography studio`;
    case "reference":
      // styled/worn inspiration shot
      return `${subject} fashion editorial street style worn`;
  }
}

function buildFallbackQuery(data: StyleData, category: Category): string {
  const subject = data.styleName || data.description || data.fabricType || "fashion garment";
  switch (category) {
    case "wip":
      return `${subject} clothing sketch design`;
    case "final":
      return `${subject} clothing`;
    case "reference":
      return `${subject} outfit fashion`;
  }
}

// ============================================================
// API WRAPPERS
// ============================================================

async function searchUnsplash(query: string, perPage: number): Promise<NormalizedPhoto[]> {
  if (!UNSPLASH_ACCESS_KEY) return [];
  const url = `${UNSPLASH_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=squarish`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });
    if (!res.ok) {
      console.log(`  ⚠️ Unsplash error ${res.status} for "${query}"`);
      return [];
    }
    const data = (await res.json()) as { results: UnsplashPhoto[] };
    return (data.results || []).map((photo) => ({
      id: `unsplash_${photo.id}`,
      downloadUrl: photo.urls.regular || photo.urls.full,
      photographer: photo.user.name,
      source: "unsplash" as const,
    }));
  } catch (error) {
    console.log(`  ⚠️ Unsplash request failed: ${(error as Error).message}`);
    return [];
  }
}

async function searchPexels(query: string, perPage: number): Promise<NormalizedPhoto[]> {
  if (!PEXELS_API_KEY) return [];
  const url = `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=square`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: PEXELS_API_KEY },
    });
    if (!res.ok) {
      console.log(`  ⚠️ Pexels error ${res.status} for "${query}"`);
      return [];
    }
    const data = (await res.json()) as { photos: PexelsPhoto[] };
    return (data.photos || []).map((photo) => ({
      id: `pexels_${photo.id}`,
      downloadUrl: photo.src.large2x || photo.src.large || photo.src.original,
      photographer: photo.photographer,
      source: "pexels" as const,
    }));
  } catch (error) {
    console.log(`  ⚠️ Pexels request failed: ${(error as Error).message}`);
    return [];
  }
}

function dedupe(photos: NormalizedPhoto[]): NormalizedPhoto[] {
  const seen = new Set<string>();
  const output: NormalizedPhoto[] = [];
  for (const photo of photos) {
    if (!seen.has(photo.id)) {
      seen.add(photo.id);
      output.push(photo);
    }
  }
  return output;
}

// ============================================================
// PHOTO FETCHING WITH FALLBACKS (per category)
// ============================================================

async function getPhotosForCategory(data: StyleData, category: Category): Promise<NormalizedPhoto[]> {
  const primaryQuery = buildCategoryQuery(data, category);
  const fallbackQuery = buildFallbackQuery(data, category);
  console.log(`  🔎 [${category}] Search: "${primaryQuery}"`);

  let photos: NormalizedPhoto[] = [];

  photos = await searchUnsplash(primaryQuery, PHOTOS_PER_CATEGORY);
  console.log(`  📷 [${category}] Unsplash primary returned ${photos.length}`);

  if (photos.length < PHOTOS_NEEDED_PER_CATEGORY) {
    const fallback = await searchUnsplash(fallbackQuery, PHOTOS_PER_CATEGORY);
    photos = dedupe([...photos, ...fallback]);
    console.log(`  📷 [${category}] Total after Unsplash fallback: ${photos.length}`);
  }

  if (photos.length < PHOTOS_NEEDED_PER_CATEGORY) {
    const pexels = await searchPexels(primaryQuery, PHOTOS_PER_CATEGORY);
    photos = dedupe([...photos, ...pexels]);
    console.log(`  📷 [${category}] Total after Pexels primary: ${photos.length}`);
  }

  if (photos.length < PHOTOS_NEEDED_PER_CATEGORY) {
    const pexelsFallback = await searchPexels(fallbackQuery, PHOTOS_PER_CATEGORY);
    photos = dedupe([...photos, ...pexelsFallback]);
    console.log(`  📷 [${category}] Total after Pexels fallback: ${photos.length}`);
  }

  return photos;
}

// ============================================================
// DOWNLOAD + PROCESS IMAGE
// ============================================================

async function downloadAndSaveImage(photo: NormalizedPhoto, destinationPath: string): Promise<void> {
  const response = await fetch(photo.downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await sharp(buffer)
    .resize(IMAGE_WIDTH, IMAGE_HEIGHT, { fit: "cover", position: "attention" })
    .jpeg({ quality: JPEG_QUALITY })
    .toFile(destinationPath);
}

// ============================================================
// GENERATE IMAGES FOR ONE STYLE
// ============================================================

async function saveCategoryImages(
  data: StyleData,
  category: Category,
  destDir: string,
  filePrefix: string
): Promise<{ saved: number; failed: number }> {
  const photos = await getPhotosForCategory(data, category);
  if (photos.length === 0) {
    console.log(`  ❌ [${category}] No photos found for "${data.styleName}".`);
    return { saved: 0, failed: PHOTOS_NEEDED_PER_CATEGORY };
  }

  const pick = (index: number): NormalizedPhoto => photos[index % photos.length];
  let saved = 0,
    failed = 0;

  for (let i = 0; i < PHOTOS_NEEDED_PER_CATEGORY; i++) {
    const dest = path.join(destDir, `${filePrefix}_${i + 1}.jpg`);
    if (await fs.pathExists(dest)) {
      console.log(`  ⏭️ Already exists: ${path.relative(process.cwd(), dest)}`);
      continue;
    }
    const photo = pick(i);
    try {
      await downloadAndSaveImage(photo, dest);
      saved++;
      console.log(`  ✅ Saved: ${path.relative(process.cwd(), dest)}`);
      console.log(`     Source: ${photo.source}, Photographer: ${photo.photographer}`);
    } catch (error) {
      failed++;
      console.log(`  ❌ Failed: ${dest}`);
      console.log(`     ${(error as Error).message}`);
    }
  }

  return { saved, failed };
}

async function generateImagesForStyle(data: StyleData): Promise<{ saved: number; failed: number }> {
  const code = data.orderCode;
  const baseDir = path.join(process.cwd(), "uploads", "styles", code);
  const wipDir = path.join(baseDir, "wip");
  const finalDir = path.join(baseDir, "final");
  const refDir = path.join(baseDir, "reference");

  await fs.ensureDir(wipDir);
  await fs.ensureDir(finalDir);
  await fs.ensureDir(refDir);

  console.log("");
  console.log(`📁 Processing: ${code} - ${data.styleName}`);
  console.log(`   Fabric: ${data.fabricType || "N/A"}`);
  console.log(`   Season: ${data.season || "N/A"}`);
  console.log(`   Colorway: ${data.colorway || "N/A"}`);
  console.log(`   Directory: ${baseDir}`);

  let totalSaved = 0,
    totalFailed = 0;

  const wipResult = await saveCategoryImages(data, "wip", wipDir, "wip");
  totalSaved += wipResult.saved;
  totalFailed += wipResult.failed;

  const finalResult = await saveCategoryImages(data, "final", finalDir, "final");
  totalSaved += finalResult.saved;
  totalFailed += finalResult.failed;

  const refResult = await saveCategoryImages(data, "reference", refDir, "reference");
  totalSaved += refResult.saved;
  totalFailed += refResult.failed;

  return { saved: totalSaved, failed: totalFailed };
}

// ============================================================
// MAIN
// ============================================================

export async function downloadStyleImages(): Promise<void> {
  console.log("");
  console.log("============================================================");
  console.log("📷 STYLE IMAGE DOWNLOADER");
  console.log("============================================================");
  console.log("");

  const styles = await getStyleOrders();
  if (styles.length === 0) {
    console.log("⚠️ No active style orders found.");
    return;
  }
  console.log(`✅ Found ${styles.length} style order(s).\n`);

  let totalSaved = 0,
    totalFailed = 0;
  for (const style of styles) {
    try {
      const result = await generateImagesForStyle(style);
      totalSaved += result.saved;
      totalFailed += result.failed;
    } catch (error) {
      console.error(`❌ Failed processing ${style.orderCode}:`, (error as Error).message);
      totalFailed += 6;
    }
    console.log(`✅ Completed: ${style.orderCode}\n`);
    await sleep(REQUEST_DELAY_MS);
  }

  console.log("");
  console.log("============================================================");
  console.log("🎉 IMAGE DOWNLOAD COMPLETE");
  console.log("============================================================");
  console.log(`✅ Images saved: ${totalSaved}`);
  console.log(`❌ Images failed: ${totalFailed}`);
  console.log(`📁 Location: ${path.join(process.cwd(), "uploads", "styles")}`);
  console.log("============================================================");
  console.log("");
}

// ============================================================
// RUN
// ============================================================

downloadStyleImages().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});