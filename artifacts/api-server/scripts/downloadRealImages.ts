import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CONFIGURATION
// ============================================================

const IMAGE_WIDTH = 600;
const IMAGE_HEIGHT = 600;
const JPEG_QUALITY = 90;

// Primary source — get a free key at https://www.pexels.com/api/
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";
const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";

// Fallback source — get an instant "Demo" key at https://unsplash.com/oauth/applications
const UNSPLASH_ACCESS_KEY = "1971_WmEI7UsG3bESicWrMhPJGGrlnhGnZrbVsFzuzw";
const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";

// How many candidate photos to pull per swatch per source.
// We need 6 images per swatch (2 wip + 2 final + 2 reference).
const PHOTOS_PER_SWATCH = 10;
const MIN_PHOTOS_NEEDED = 6;

// Delay between swatches so we stay well under both APIs' rate limits.
// Unsplash Demo mode is the tightest limit at 50 req/hour, so pace accordingly.
const REQUEST_DELAY_MS = 1200;

if (!PEXELS_API_KEY && !UNSPLASH_ACCESS_KEY) {
  console.error("❌ Missing both PEXELS_API_KEY and UNSPLASH_ACCESS_KEY environment variables.");
  console.error("   Set at least one:");
  console.error("   PEXELS_API_KEY=your_key UNSPLASH_ACCESS_KEY=your_key node generate-realistic-images.js");
  process.exit(1);
}

// ============================================================
// TYPES
// ============================================================

interface SwatchData {
  swatchCode: string;
  swatchName: string;
  fabricType: string;
  quality: string;
  colorName: string;
  hexCode: string;
  pattern?: string; // optional explicit pattern hint (floral, striped, etc.)
}

// Normalized photo shape so downstream code doesn't care which API it came from
interface NormalizedPhoto {
  id: string;
  downloadUrl: string;
  photographer: string;
  source: "pexels" | "unsplash";
}

interface PexelsPhoto {
  id: number;
  src: { original: string; large2x: string; large: string; medium: string };
  photographer: string;
}

interface UnsplashPhoto {
  id: string;
  urls: { raw: string; full: string; regular: string };
  user: { name: string };
}

// ============================================================
// UTIL: sleep
// ============================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// BUILD SEARCH QUERIES FROM SWATCH DESCRIPTION
// ============================================================

function buildSearchQuery(data: SwatchData): string {
  const parts: string[] = [];

  if (data.colorName) {
    const cleanedColor = data.colorName.replace(/multi\s*color/i, "").trim();
    if (cleanedColor) parts.push(cleanedColor);
  }

  parts.push(data.fabricType);
  if (data.pattern) parts.push(data.pattern);
  parts.push("fabric texture close up");

  return parts.filter(Boolean).join(" ");
}

function buildFallbackQuery(data: SwatchData): string {
  return `${data.fabricType} fabric texture`;
}

// ============================================================
// PEXELS API
// ============================================================

async function searchPexels(query: string, perPage: number): Promise<NormalizedPhoto[]> {
  if (!PEXELS_API_KEY) return [];

  const url = `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=square`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });

  if (!res.ok) {
    console.log(`  ⚠️  Pexels error ${res.status} for "${query}"`);
    return [];
  }

  const data = (await res.json()) as { photos: PexelsPhoto[] };
  return (data.photos || []).map((p) => ({
    id: `pexels_${p.id}`,
    downloadUrl: p.src.large2x || p.src.large || p.src.original,
    photographer: p.photographer,
    source: "pexels" as const,
  }));
}

// ============================================================
// UNSPLASH API (fallback)
// ============================================================

async function searchUnsplash(query: string, perPage: number): Promise<NormalizedPhoto[]> {
  if (!UNSPLASH_ACCESS_KEY) return [];

  const url = `${UNSPLASH_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=squarish`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
  });

  if (!res.ok) {
    console.log(`  ⚠️  Unsplash error ${res.status} for "${query}"`);
    return [];
  }

  const data = (await res.json()) as { results: UnsplashPhoto[] };
  return (data.results || []).map((p) => ({
    id: `unsplash_${p.id}`,
    downloadUrl: p.urls.regular || p.urls.full,
    photographer: p.user.name,
    source: "unsplash" as const,
  }));
}

// ============================================================
// COMBINED SEARCH: Pexels first, Unsplash fills the gap
// ============================================================

async function getPhotosForSwatch(data: SwatchData): Promise<NormalizedPhoto[]> {
  const primaryQuery = buildSearchQuery(data);
  const fallbackQuery = buildFallbackQuery(data);

  let photos: NormalizedPhoto[] = await searchPexels(primaryQuery, PHOTOS_PER_SWATCH);

  if (photos.length < MIN_PHOTOS_NEEDED) {
    console.log(`  ↳ Pexels returned ${photos.length} for "${primaryQuery}", trying Pexels fallback query…`);
    const pexelsFallback = await searchPexels(fallbackQuery, PHOTOS_PER_SWATCH);
    photos = dedupe([...photos, ...pexelsFallback]);
  }

  if (photos.length < MIN_PHOTOS_NEEDED) {
    console.log(`  ↳ Still short (${photos.length}), pulling from Unsplash…`);
    const unsplashPrimary = await searchUnsplash(primaryQuery, PHOTOS_PER_SWATCH);
    photos = dedupe([...photos, ...unsplashPrimary]);
  }

  if (photos.length < MIN_PHOTOS_NEEDED) {
    console.log(`  ↳ Still short (${photos.length}), trying broader Unsplash query…`);
    const unsplashFallback = await searchUnsplash(fallbackQuery, PHOTOS_PER_SWATCH);
    photos = dedupe([...photos, ...unsplashFallback]);
  }

  return photos;
}

function dedupe(photos: NormalizedPhoto[]): NormalizedPhoto[] {
  const seen = new Set<string>();
  const out: NormalizedPhoto[] = [];
  for (const p of photos) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}

// ============================================================
// DOWNLOAD + PROCESS IMAGE
// ============================================================

async function downloadAndSaveImage(photo: NormalizedPhoto, destPath: string): Promise<void> {
  const res = await fetch(photo.downloadUrl);
  if (!res.ok) {
    throw new Error(`Failed to download image ${photo.downloadUrl}: ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await sharp(buffer)
    .resize(IMAGE_WIDTH, IMAGE_HEIGHT, { fit: "cover", position: "attention" })
    .jpeg({ quality: JPEG_QUALITY })
    .toFile(destPath);
}

// ============================================================
// SWATCH DATA
// ============================================================

const swatchData: SwatchData[] = [
  { swatchCode: "CL001-SW001", swatchName: "Recycled Licensed Aluminum Shirt", fabricType: "Cotton", quality: "Premium", colorName: "Recycled White", hexCode: "#F5F5F0" },
  { swatchCode: "CL001-SW002", swatchName: "Gold Sequins Embellishment", fabricType: "Polyester", quality: "Standard", colorName: "Gold", hexCode: "#FFD700", pattern: "sequin" },
  { swatchCode: "CL002-SW001", swatchName: "Blue Silk Charmeuse", fabricType: "Silk", quality: "Premium", colorName: "Royal Blue", hexCode: "#4169E1" },
  { swatchCode: "CL002-SW002", swatchName: "Black Velvet Evening Fabric", fabricType: "Velvet", quality: "Premium", colorName: "Midnight Black", hexCode: "#1a1a1a" },
  { swatchCode: "CL003-SW001", swatchName: "Floral Print Cotton Dress", fabricType: "Cotton", quality: "Standard", colorName: "Multi Color Floral", hexCode: "#FF6B6B", pattern: "floral" },
  { swatchCode: "CL004-SW001", swatchName: "Green Polyester Sportswear", fabricType: "Polyester", quality: "Standard", colorName: "Forest Green", hexCode: "#228B22" },
  { swatchCode: "CL005-SW001", swatchName: "White Mesh Sportswear", fabricType: "Mesh", quality: "Premium", colorName: "Pure White", hexCode: "#FFFFFF" },
  { swatchCode: "CL006-SW001", swatchName: "Indigo Denim Jean Fabric", fabricType: "Denim", quality: "Premium", colorName: "Indigo Blue", hexCode: "#1E3A8A" },
  { swatchCode: "CL007-SW001", swatchName: "Orange Nylon Activewear", fabricType: "Nylon", quality: "Standard", colorName: "Safety Orange", hexCode: "#FFA500" },
  { swatchCode: "CL008-SW001", swatchName: "Charcoal Grey Spandex Yoga", fabricType: "Spandex", quality: "Premium", colorName: "Charcoal Grey", hexCode: "#808080" },
  { swatchCode: "CL009-SW001", swatchName: "Black Compression Base Layer", fabricType: "Knit", quality: "Premium", colorName: "Jet Black", hexCode: "#1a1a1a" },
  { swatchCode: "CL010-SW001", swatchName: "Yellow Polyester Rainwear", fabricType: "Polyester", quality: "Standard", colorName: "Bright Yellow", hexCode: "#FFD700" },
  { swatchCode: "CL011-SW001", swatchName: "Deep Purple Nulu Fabric", fabricType: "Knit", quality: "Premium", colorName: "Deep Purple", hexCode: "#800080" },
  { swatchCode: "CL012-SW001", swatchName: "Navy Terry Toweling Fabric", fabricType: "Terry cloth", quality: "Standard", colorName: "Navy Blue", hexCode: "#000080" },
  { swatchCode: "CL013-SW001", swatchName: "Blush Pink Fleece Winter", fabricType: "Fleece", quality: "Premium", colorName: "Blush Pink", hexCode: "#FFC0CB" },
  { swatchCode: "CL014-SW001", swatchName: "Silver Lycra Dancewear", fabricType: "Lycra", quality: "Premium", colorName: "Silver", hexCode: "#C0C0C0" },
  { swatchCode: "CL015-SW001", swatchName: "Beige Suede Luxe Fabric", fabricType: "Suede", quality: "Standard", colorName: "Beige", hexCode: "#F5F5DC" },
  { swatchCode: "CL016-SW001", swatchName: "Black/White Checkered Canvas", fabricType: "Canvas", quality: "Standard", colorName: "Checkered", hexCode: "#000000", pattern: "checkered" },
  { swatchCode: "CL017-SW001", swatchName: "Rich Brown Leather Heritage", fabricType: "Leather", quality: "Premium", colorName: "Rich Brown", hexCode: "#8B4513" },
  { swatchCode: "CL018-SW001", swatchName: "Off-White Duck Canvas", fabricType: "Canvas", quality: "Standard", colorName: "Off-White", hexCode: "#F5F5F0" },
  { swatchCode: "CL019-SW001", swatchName: "Black Gore-Tex Waterproof", fabricType: "Gore-Tex", quality: "Premium", colorName: "Black", hexCode: "#000000" },
  { swatchCode: "CL020-SW001", swatchName: "Paisley Print Silk Fabric", fabricType: "Silk", quality: "Standard", colorName: "Multi Color Paisley", hexCode: "#FF1493", pattern: "paisley" },
];

// ============================================================
// MAIN GENERATION FUNCTION
// ============================================================

export async function generateRealisticImages(): Promise<void> {
  console.log("\n📷 Fetching realistic fabric photos (Pexels → Unsplash fallback)...\n");

  let totalImages = 0;
  let totalFailed = 0;

  for (const data of swatchData) {
    const code = data.swatchCode;
    const baseDir = path.join(process.cwd(), "uploads", "swatches", code);
    const wipDir = path.join(baseDir, "wip");
    const finalDir = path.join(baseDir, "final");
    const refDir = path.join(baseDir, "reference");

    await fs.ensureDir(wipDir);
    await fs.ensureDir(finalDir);
    await fs.ensureDir(refDir);

    console.log(`📁 Processing: ${code} - ${data.swatchName}`);

    try {
      const photos = await getPhotosForSwatch(data);

      if (photos.length === 0) {
        console.log(`  ❌ No photos found for "${data.swatchName}" from either source — skipping.`);
        totalFailed += 6;
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const pick = (i: number) => photos[i % photos.length];

      const targets = [
        { photo: pick(0), dest: path.join(wipDir, "sample_wip_1.jpg") },
        { photo: pick(1), dest: path.join(wipDir, "sample_wip_2.jpg") },
        { photo: pick(2), dest: path.join(finalDir, "sample_final_1.jpg") },
        { photo: pick(3), dest: path.join(finalDir, "sample_final_2.jpg") },
        { photo: pick(4), dest: path.join(refDir, "reference_1.jpg") },
        { photo: pick(5), dest: path.join(refDir, "reference_2.jpg") },
      ];

      for (const t of targets) {
        try {
          await downloadAndSaveImage(t.photo, t.dest);
          totalImages++;
          console.log(`  ✅ Saved: ${path.relative(process.cwd(), t.dest)} (${t.photo.source}, photo by ${t.photo.photographer})`);
        } catch (err) {
          totalFailed++;
          console.log(`  ❌ Failed to save ${t.dest}:`, (err as Error).message);
        }
      }
    } catch (err) {
      console.log(`  ❌ Search failed for "${data.swatchName}":`, (err as Error).message);
      totalFailed += 6;
    }

    console.log(`✅ Completed: ${code}\n`);
    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`\n🎉 Done. ${totalImages} images saved, ${totalFailed} failed.`);
  console.log(`📁 Images saved in: ${path.join(process.cwd(), "uploads", "swatches")}`);
  console.log(`ℹ️  Photos sourced from Pexels and/or Unsplash — both free to use; Unsplash asks for photographer credit where practical.`);
}

// ============================================================
// RUN
// ============================================================

generateRealisticImages().catch(console.error);