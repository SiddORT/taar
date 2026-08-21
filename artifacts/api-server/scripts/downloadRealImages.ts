import "dotenv/config";
import sharp from "sharp";
import fs from "fs-extra";
import path from "path";

import { eq } from "drizzle-orm";

import { db } from "@workspace/db";
import { swatchOrdersTable } from "@workspace/db";

// ============================================================
// CONFIGURATION
// ============================================================

const IMAGE_WIDTH = 600;
const IMAGE_HEIGHT = 600;
const JPEG_QUALITY = 90;

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";
const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "1971_WmEI7UsG3bESicWrMhPJGGrlnhGnZrbVsFzuzw";
const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";

// Number of candidate photos to request from each API.
const PHOTOS_PER_SWATCH = 10;

// We need at least 6 photos:
// 2 WIP + 2 Final + 2 Reference
const MIN_PHOTOS_NEEDED = 6;

// Delay between swatches.
const REQUEST_DELAY_MS = 1200;

// ============================================================
// VALIDATION
// ============================================================

if (!PEXELS_API_KEY && !UNSPLASH_ACCESS_KEY) {
  console.error(
    "❌ Missing both PEXELS_API_KEY and UNSPLASH_ACCESS_KEY."
  );

  console.error("\nAdd at least one of these to your .env:");

  console.error(`
PEXELS_API_KEY=your_pexels_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
`);

  process.exit(1);
}

// ============================================================
// TYPES
// ============================================================

interface SwatchData {
  id: number;
  orderCode: string;
  swatchName: string;
  fabricName: string | null;
  description: string | null;
}

interface NormalizedPhoto {
  id: string;
  downloadUrl: string;
  photographer: string;
  source: "pexels" | "unsplash";
}

interface PexelsPhoto {
  id: number;

  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
  };

  photographer: string;
}

interface UnsplashPhoto {
  id: string;

  urls: {
    raw: string;
    full: string;
    regular: string;
  };

  user: {
    name: string;
  };
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

async function getSwatchOrders(): Promise<SwatchData[]> {
  console.log("🔍 Fetching swatch orders from database...");

  const swatches = await db
    .select({
      id: swatchOrdersTable.id,
      orderCode: swatchOrdersTable.orderCode,
      swatchName: swatchOrdersTable.swatchName,
      fabricName: swatchOrdersTable.fabricName,
      description: swatchOrdersTable.description,
    })
    .from(swatchOrdersTable)
    .where(eq(swatchOrdersTable.isDeleted, false));

  return swatches;
}

// ============================================================
// BUILD SEARCH QUERY
// ============================================================

function buildSearchQuery(data: SwatchData): string {
  const parts: string[] = [];

  if (data.swatchName) {
    parts.push(data.swatchName);
  }

  if (data.fabricName) {
    parts.push(data.fabricName);
  }

  if (data.description) {
    parts.push(data.description);
  }

  parts.push("fabric textile texture close up");

  return parts
    .filter(Boolean)
    .join(" ")
    .trim();
}

function buildFallbackQuery(data: SwatchData): string {
  const fabric = data.fabricName || "fabric";

  return `${fabric} fabric textile texture close up`;
}

// ============================================================
// PEXELS API
// ============================================================

async function searchPexels(
  query: string,
  perPage: number
): Promise<NormalizedPhoto[]> {
  if (!PEXELS_API_KEY) {
    return [];
  }

  const url =
    `${PEXELS_SEARCH_URL}` +
    `?query=${encodeURIComponent(query)}` +
    `&per_page=${perPage}` +
    `&orientation=square`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!res.ok) {
      console.log(
        `  ⚠️ Pexels error ${res.status} for "${query}"`
      );

      return [];
    }

    const data = (await res.json()) as {
      photos: PexelsPhoto[];
    };

    return (data.photos || []).map((photo) => ({
      id: `pexels_${photo.id}`,

      downloadUrl:
        photo.src.large2x ||
        photo.src.large ||
        photo.src.original,

      photographer: photo.photographer,

      source: "pexels",
    }));
  } catch (error) {
    console.log(
      `  ⚠️ Pexels request failed for "${query}":`,
      (error as Error).message
    );

    return [];
  }
}

// ============================================================
// UNSPLASH API
// ============================================================

async function searchUnsplash(
  query: string,
  perPage: number
): Promise<NormalizedPhoto[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    return [];
  }

  const url =
    `${UNSPLASH_SEARCH_URL}` +
    `?query=${encodeURIComponent(query)}` +
    `&per_page=${perPage}` +
    `&orientation=squarish`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!res.ok) {
      console.log(
        `  ⚠️ Unsplash error ${res.status} for "${query}"`
      );

      return [];
    }

    const data = (await res.json()) as {
      results: UnsplashPhoto[];
    };

    return (data.results || []).map((photo) => ({
      id: `unsplash_${photo.id}`,

      downloadUrl:
        photo.urls.regular ||
        photo.urls.full,

      photographer: photo.user.name,

      source: "unsplash",
    }));
  } catch (error) {
    console.log(
      `  ⚠️ Unsplash request failed for "${query}":`,
      (error as Error).message
    );

    return [];
  }
}

// ============================================================
// DEDUPE
// ============================================================

function dedupe(
  photos: NormalizedPhoto[]
): NormalizedPhoto[] {
  const seen = new Set<string>();

  const output: NormalizedPhoto[] = [];

  for (const photo of photos) {
    if (seen.has(photo.id)) {
      continue;
    }

    seen.add(photo.id);

    output.push(photo);
  }

  return output;
}

// ============================================================
// GET PHOTOS
// ============================================================

async function getPhotosForSwatch(
  data: SwatchData
): Promise<NormalizedPhoto[]> {
  const primaryQuery = buildSearchQuery(data);

  const fallbackQuery = buildFallbackQuery(data);

  console.log(`  🔎 Search: "${primaryQuery}"`);

  // ----------------------------------------------------------
  // PEXELS PRIMARY
  // ----------------------------------------------------------

  let photos = await searchPexels(
    primaryQuery,
    PHOTOS_PER_SWATCH
  );

  console.log(
    `  📷 Pexels primary returned ${photos.length} photo(s)`
  );

  // ----------------------------------------------------------
  // PEXELS FALLBACK
  // ----------------------------------------------------------

  if (photos.length < MIN_PHOTOS_NEEDED) {
    console.log(
      `  ↳ Pexels returned fewer than ${MIN_PHOTOS_NEEDED}.`
    );

    console.log(
      `  ↳ Trying Pexels fallback: "${fallbackQuery}"`
    );

    const fallbackPhotos = await searchPexels(
      fallbackQuery,
      PHOTOS_PER_SWATCH
    );

    photos = dedupe([
      ...photos,
      ...fallbackPhotos,
    ]);

    console.log(
      `  📷 Total after Pexels fallback: ${photos.length}`
    );
  }

  // ----------------------------------------------------------
  // UNSPLASH PRIMARY
  // ----------------------------------------------------------

  if (photos.length < MIN_PHOTOS_NEEDED) {
    console.log(
      `  ↳ Still short. Trying Unsplash primary...`
    );

    const unsplashPhotos = await searchUnsplash(
      primaryQuery,
      PHOTOS_PER_SWATCH
    );

    photos = dedupe([
      ...photos,
      ...unsplashPhotos,
    ]);

    console.log(
      `  📷 Total after Unsplash primary: ${photos.length}`
    );
  }

  // ----------------------------------------------------------
  // UNSPLASH FALLBACK
  // ----------------------------------------------------------

  if (photos.length < MIN_PHOTOS_NEEDED) {
    console.log(
      `  ↳ Still short. Trying Unsplash fallback...`
    );

    const unsplashFallback = await searchUnsplash(
      fallbackQuery,
      PHOTOS_PER_SWATCH
    );

    photos = dedupe([
      ...photos,
      ...unsplashFallback,
    ]);

    console.log(
      `  📷 Total after Unsplash fallback: ${photos.length}`
    );
  }

  return photos;
}

// ============================================================
// DOWNLOAD + PROCESS IMAGE
// ============================================================

async function downloadAndSaveImage(
  photo: NormalizedPhoto,
  destinationPath: string
): Promise<void> {
  const response = await fetch(photo.downloadUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download image: ${response.status} ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  const buffer = Buffer.from(arrayBuffer);

  await sharp(buffer)
    .resize(
      IMAGE_WIDTH,
      IMAGE_HEIGHT,
      {
        fit: "cover",
        position: "attention",
      }
    )
    .jpeg({
      quality: JPEG_QUALITY,
    })
    .toFile(destinationPath);
}

// ============================================================
// GENERATE IMAGES FOR ONE SWATCH
// ============================================================

async function generateImagesForSwatch(
  data: SwatchData
): Promise<{
  saved: number;
  failed: number;
}> {
  const code = data.orderCode;

  // IMPORTANT:
  // This is now coming from the database.
  const baseDir = path.join(
    process.cwd(),
    "uploads",
    "swatches",
    code
  );

  const wipDir = path.join(
    baseDir,
    "wip"
  );

  const finalDir = path.join(
    baseDir,
    "final"
  );

  const referenceDir = path.join(
    baseDir,
    "reference"
  );

  await fs.ensureDir(wipDir);
  await fs.ensureDir(finalDir);
  await fs.ensureDir(referenceDir);

  console.log("");
  console.log(
    `📁 Processing: ${code} - ${data.swatchName}`
  );

  console.log(
    `   Fabric: ${data.fabricName || "N/A"}`
  );

  console.log(
    `   Directory: ${baseDir}`
  );

  // ----------------------------------------------------------
  // FETCH PHOTOS
  // ----------------------------------------------------------

  const photos = await getPhotosForSwatch(data);

  if (photos.length === 0) {
    console.log(
      `  ❌ No photos found for "${data.swatchName}".`
    );

    return {
      saved: 0,
      failed: 6,
    };
  }

  console.log(
    `  ✅ Found ${photos.length} candidate photo(s)`
  );

  // ----------------------------------------------------------
  // PICK PHOTO
  // ----------------------------------------------------------

  const pick = (index: number): NormalizedPhoto => {
    return photos[index % photos.length];
  };

  // ----------------------------------------------------------
  // TARGET FILES
  // ----------------------------------------------------------

  const targets = [
    {
      photo: pick(0),
      destination: path.join(
        wipDir,
        "sample_wip_1.jpg"
      ),
    },

    {
      photo: pick(1),
      destination: path.join(
        wipDir,
        "sample_wip_2.jpg"
      ),
    },

    {
      photo: pick(2),
      destination: path.join(
        finalDir,
        "sample_final_1.jpg"
      ),
    },

    {
      photo: pick(3),
      destination: path.join(
        finalDir,
        "sample_final_2.jpg"
      ),
    },

    {
      photo: pick(4),
      destination: path.join(
        referenceDir,
        "reference_1.jpg"
      ),
    },

    {
      photo: pick(5),
      destination: path.join(
        referenceDir,
        "reference_2.jpg"
      ),
    },
  ];

  let saved = 0;
  let failed = 0;

  // ----------------------------------------------------------
  // DOWNLOAD
  // ----------------------------------------------------------

  for (const target of targets) {
    try {
      // Don't download again if file already exists.
      if (await fs.pathExists(target.destination)) {
        console.log(
          `  ⏭️ Already exists: ${path.relative(
            process.cwd(),
            target.destination
          )}`
        );

        continue;
      }

      await downloadAndSaveImage(
        target.photo,
        target.destination
      );

      saved++;

      console.log(
        `  ✅ Saved: ${path.relative(
          process.cwd(),
          target.destination
        )}`
      );

      console.log(
        `     Source: ${target.photo.source}`
      );

      console.log(
        `     Photographer: ${target.photo.photographer}`
      );
    } catch (error) {
      failed++;

      console.log(
        `  ❌ Failed: ${target.destination}`
      );

      console.log(
        `     ${(error as Error).message}`
      );
    }
  }

  return {
    saved,
    failed,
  };
}

// ============================================================
// MAIN
// ============================================================

export async function generateRealisticImages(): Promise<void> {
  console.log("");
  console.log(
    "============================================================"
  );
  console.log(
    "📷 REALISTIC SWATCH IMAGE GENERATOR"
  );
  console.log(
    "============================================================"
  );
  console.log("");

  console.log(
    "🔌 Database: connected through Drizzle"
  );

  console.log(
    "📁 Upload directory:",
    path.join(
      process.cwd(),
      "uploads",
      "swatches"
    )
  );

  console.log("");

  // ----------------------------------------------------------
  // GET DATABASE RECORDS
  // ----------------------------------------------------------

  let swatches: SwatchData[];

  try {
    swatches = await getSwatchOrders();
  } catch (error) {
    console.error(
      "❌ Failed to fetch swatch orders from database."
    );

    console.error(
      (error as Error).message
    );

    process.exit(1);
  }

  if (swatches.length === 0) {
    console.log(
      "⚠️ No active swatch orders found in database."
    );

    return;
  }

  console.log(
    `✅ Found ${swatches.length} swatch order(s).`
  );

  console.log("");

  // ----------------------------------------------------------
  // PROCESS
  // ----------------------------------------------------------

  let totalImages = 0;
  let totalFailed = 0;

  for (const swatch of swatches) {
    try {
      const result =
        await generateImagesForSwatch(swatch);

      totalImages += result.saved;
      totalFailed += result.failed;
    } catch (error) {
      console.log(
        `❌ Failed processing ${swatch.orderCode}:`,
        (error as Error).message
      );

      totalFailed += 6;
    }

    console.log(
      `✅ Completed: ${swatch.orderCode}`
    );

    console.log("");

    await sleep(REQUEST_DELAY_MS);
  }

  // ----------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------

  console.log("");
  console.log(
    "============================================================"
  );

  console.log(
    "🎉 IMAGE GENERATION COMPLETE"
  );

  console.log(
    "============================================================"
  );

  console.log(
    `✅ Images saved: ${totalImages}`
  );

  console.log(
    `❌ Images failed: ${totalFailed}`
  );

  console.log(
    `📁 Location: ${path.join(
      process.cwd(),
      "uploads",
      "swatches"
    )}`
  );

  console.log(
    "============================================================"
  );

  console.log("");
}

// ============================================================
// RUN
// ============================================================

generateRealisticImages().catch((error) => {
  console.error("");
  console.error(
    "❌ Fatal error:"
  );

  console.error(error);

  process.exit(1);
});