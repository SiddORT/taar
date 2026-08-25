import {
  db,
  styleOrdersTable,
  styleOrderProductsTable,
  styleOrderArtworksTable,
  usersTable,
  unitTypesTable,
  eq,
  and,
  sql,
  inArray,
} from "@workspace/db";
import { faker } from "@faker-js/faker";
import fs from "fs-extra";
import path from "path";


// Types


interface ImageItem {
  data: string;
  name: string;
  size: number;
  type: string;
}

interface StyleOrderArtworkSeedData {
  styleOrderId: number;
  styleOrderProductId?: number | null;
  styleOrderProductName?: string | null;
  artworkName: string;
  unitLength?: string | null;
  unitWidth?: string | null;
  unitType?: string | null;
  artworkCreated?: string;
  workHours?: string | null;
  hourlyRate?: string | null;
  totalCost?: string | null;
  outsourceVendorId?: string | null;
  outsourceVendorName?: string | null;
  outsourcePaymentDate?: string | null;
  outsourcePaymentAmount?: string | null;
  outsourcePaymentMode?: string | null;
  outsourceTransactionId?: string | null;
  outsourcePaymentStatus?: string | null;
  toileMakingCost?: string | null;
  toileVendorId?: string | null;
  toileVendorName?: string | null;
  toileCost?: string | null;
  toilePaymentType?: string | null;
  toilePaymentDate?: string | null;
  toilePaymentMode?: string | null;
  toilePaymentStatus?: string | null;
  toilePaymentAmount?: string | null;
  toileTransactionId?: string | null;
  toileRemarks?: string | null;
  toileImages?: object[] | null;
  patternType?: string | null;
  patternMakingCost?: string | null;
  patternDoc?: object[] | null;
  patternOuthouseDoc?: object[] | null;
  patternVendorId?: string | null;
  patternVendorName?: string | null;
  patternPaymentType?: string | null;
  patternPaymentMode?: string | null;
  patternPaymentStatus?: string | null;
  patternPaymentAmount?: string | null;
  patternTransactionId?: string | null;
  patternPaymentDate?: string | null;
  patternRemarks?: string | null;
  feedbackStatus?: string;
  files?: object[];
  refImages?: ImageItem[];
  wipImages?: ImageItem[];
  finalImages?: ImageItem[];
  videos?: object[];
  createdBy: string;
  createdAt?: Date; 
}


// Image directory config


const STYLE_UPLOADS_DIR =
  process.env.STYLE_UPLOADS_DIR || path.join(process.cwd(), "uploads", "styles");


// Base64 Image Helper Functions (reused)


function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".bmp": "image/bmp",
  };
  return mimeTypes[ext] || "image/png";
}

async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

async function imageToBase64(imagePath: string): Promise<string> {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const base64 = imageBuffer.toString("base64");
    const mimeType = getMimeType(imagePath);
    return "data:" + mimeType + ";base64," + base64;
  } catch (error) {
    console.warn("Could not read image: " + imagePath);
    return generatePlaceholderBase64();
  }
}

function generatePlaceholderBase64(): string {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
}

async function readImageFiles(dir: string): Promise<string[]> {
  try {
    if (!(await fs.pathExists(dir))) return [];
    const files = await fs.readdir(dir);
    return files.filter((f) => /\.(png|jpg|jpeg|gif|webp)$/i.test(f));
  } catch {
    return [];
  }
}

async function scanAvailableStyleImageCodes(): Promise<Set<string>> {
  const available = new Set<string>();

  if (!(await fs.pathExists(STYLE_UPLOADS_DIR))) {
    return available;
  }

  const entries = await fs.readdir(STYLE_UPLOADS_DIR);

  for (const code of entries) {
    const codeDir = path.join(STYLE_UPLOADS_DIR, code);
    const stat = await fs.stat(codeDir).catch(() => null);
    if (!stat || !stat.isDirectory()) continue;

    const wipFiles = await readImageFiles(path.join(codeDir, "wip"));
    const finalFiles = await readImageFiles(path.join(codeDir, "final"));
    const refFiles = await readImageFiles(path.join(codeDir, "reference"));

    if (wipFiles.length > 0 || finalFiles.length > 0 || refFiles.length > 0) {
      available.add(code);
    }
  }

  return available;
}

/**
 * Loads images from the style uploads folder for a given style order code
 */
async function loadStyleArtworkImages(orderCode: string): Promise<{
  refImages: ImageItem[];
  wipImages: ImageItem[];
  finalImages: ImageItem[];
}> {
  const baseDir = path.join(STYLE_UPLOADS_DIR, orderCode);

  const result = {
    refImages: [] as ImageItem[],
    wipImages: [] as ImageItem[],
    finalImages: [] as ImageItem[],
  };

  // Load Reference images
  const refDir = path.join(baseDir, "reference");
  try {
    if (await fs.pathExists(refDir)) {
      const imageFiles = await readImageFiles(refDir);
      for (const file of imageFiles) {
        const filePath = path.join(refDir, file);
        const base64Data = await imageToBase64(filePath);
        const size = await getFileSize(filePath);
        const mimeType = getMimeType(filePath);

        result.refImages.push({
          data: base64Data,
          name: file,
          size: size,
          type: mimeType,
        });
      }
    }
  } catch (error) {
    // Silently fail
  }

  // Load WIP images
  const wipDir = path.join(baseDir, "wip");
  try {
    if (await fs.pathExists(wipDir)) {
      const imageFiles = await readImageFiles(wipDir);
      for (const file of imageFiles) {
        const filePath = path.join(wipDir, file);
        const base64Data = await imageToBase64(filePath);
        const size = await getFileSize(filePath);
        const mimeType = getMimeType(filePath);

        result.wipImages.push({
          data: base64Data,
          name: file,
          size: size,
          type: mimeType,
        });
      }
    }
  } catch (error) {
    // Silently fail
  }

  // Load Final images
  const finalDir = path.join(baseDir, "final");
  try {
    if (await fs.pathExists(finalDir)) {
      const imageFiles = await readImageFiles(finalDir);
      for (const file of imageFiles) {
        const filePath = path.join(finalDir, file);
        const base64Data = await imageToBase64(filePath);
        const size = await getFileSize(filePath);
        const mimeType = getMimeType(filePath);

        result.finalImages.push({
          data: base64Data,
          name: file,
          size: size,
          type: mimeType,
        });
      }
    }
  } catch (error) {
    // Silently fail
  }

  // Generate placeholder if no images found
  const placeholderData = generatePlaceholderBase64();

  if (result.refImages.length === 0) {
    result.refImages = [
      { data: placeholderData, name: "Reference Placeholder 1", size: 0, type: "image/png" },
      { data: placeholderData, name: "Reference Placeholder 2", size: 0, type: "image/png" },
    ];
  }

  if (result.wipImages.length === 0) {
    result.wipImages = [
      { data: placeholderData, name: "WIP Placeholder 1", size: 0, type: "image/png" },
      { data: placeholderData, name: "WIP Placeholder 2", size: 0, type: "image/png" },
    ];
  }

  if (result.finalImages.length === 0) {
    result.finalImages = [
      { data: placeholderData, name: "Final Placeholder 1", size: 0, type: "image/png" },
      { data: placeholderData, name: "Final Placeholder 2", size: 0, type: "image/png" },
    ];
  }

  return result;
}


// Helper Functions


// Will be fetched from DB, but we keep a fallback
const DEFAULT_UNIT_TYPES = ["Inch", "Centimeter", "Millimeter", "Meter", "Feet"];

function getRandomPaymentStatus(): string {
  return faker.helpers.arrayElement(["Pending", "Paid", "Partially Paid"]);
}

function getRandomFeedbackStatus(): string {
  return faker.helpers.arrayElement([
    "Pending",
    "In Progress",
    "Approved",
    "Rejected",
    "Changes Requested",
  ]);
}

function getRandomPaymentMode(): string {
  return faker.helpers.arrayElement(["Cash", "Bank Transfer", "UPI", "Cheque", "Card"]);
}

function getRandomPaymentType(): string {
  return faker.helpers.arrayElement(["Full", "Partial", "Advance"]);
}

/**
 * Generate artwork name based on style order and product info
 */
function generateArtworkNameFromStyle(
  styleName: string,
  productName?: string | null,
  index: number = 0
): string {
  const base = productName && productName.trim() ? productName : styleName;
  // Clean up: remove extra spaces
  const cleanBase = base.replace(/\s+/g, " ").trim();

  if (index === 0) {
    // First artwork: just the base name + "Artwork"
    return `${cleanBase} Artwork`;
  }

  // Subsequent: add variation
  const suffixes = ["Design", "Pattern", "Motif", "Detail", "Print", "Draft", "Final", "Sample"];
  const versions = ["v1", "v2", "final", "draft", "sample"];
  const suffix = faker.helpers.arrayElement(suffixes);
  const version = faker.helpers.arrayElement(versions);

  const templates = [
    () => `${cleanBase} – ${suffix}`,
    () => `${cleanBase} (${version})`,
    () => `${cleanBase} ${suffix} ${version}`,
    () => `${cleanBase} – Variation ${index}`,
    () => `${styleName} ${suffix}`,
  ];

  return faker.helpers.arrayElement(templates)();
}

/**
 * Generate artwork code in format SOA-YYYY-XXX
 */
function generateArtworkCode(artworkId: number): string {
  const date = new Date();
  const year = date.getFullYear();
  return "SOA-" + year + "-" + String(artworkId).padStart(3, "0");
}

// Date Helper: Random date between two dates

/**
 * Parses a date string (assumes YYYY-MM-DD or ISO) and returns a Date object.
 * If invalid, returns null.
 */
function parseDateString(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Returns a random Date between startDate and endDate (inclusive).
 * If either date is null/invalid, returns the current date.
 * If startDate > endDate, swaps them.
 */
function getRandomDateBetween(startStr: string | null, endStr: string | null): Date {
  const start = parseDateString(startStr);
  const end = parseDateString(endStr);

  // Fallback to current date if either is invalid
  if (!start || !end) {
    return new Date();
  }

  // Ensure start <= end
  const from = start.getTime() <= end.getTime() ? start : end;
  const to = start.getTime() <= end.getTime() ? end : start;

  // If same date, return that date
  if (from.getTime() === to.getTime()) {
    return from;
  }

  // Generate random timestamp between from and to
  const randomTime = from.getTime() + Math.random() * (to.getTime() - from.getTime());
  return new Date(randomTime);
}

// Main Seed Function

export async function seedStyleOrderArtworks(count: number = 30): Promise<void> {
  console.log("\n🎨 Starting StyleOrderArtworkSeeder with " + count + " artworks...\n");

  // 1. Fetch style orders (non-deleted) including date fields
  const styleOrders = await db
    .select({
      id: styleOrdersTable.id,
      orderCode: styleOrdersTable.orderCode,
      styleName: styleOrdersTable.styleName,
      orderIssueDate: styleOrdersTable.orderIssueDate,   
      deliveryDate: styleOrdersTable.deliveryDate,       
    })
    .from(styleOrdersTable)
    .where(eq(styleOrdersTable.isDeleted, false));

  console.log("   ✅ Found " + styleOrders.length + " style orders");

  if (styleOrders.length === 0) {
    console.warn("⚠️ No style orders found. Please seed style orders first.");
    return;
  }

  // 2. Fetch style order products for these orders
  const orderIds = styleOrders.map((o) => o.id);
  const products = await db
    .select({
      id: styleOrderProductsTable.id,
      styleOrderId: styleOrderProductsTable.styleOrderId,
      productName: styleOrderProductsTable.productName,
    })
    .from(styleOrderProductsTable)
    .where(
      and(
        eq(styleOrderProductsTable.isDeleted, false),
        inArray(styleOrderProductsTable.styleOrderId, orderIds)
      )
    );

  // Group products by styleOrderId
  const productsByOrder: Record<number, typeof products> = {};
  for (const p of products) {
    if (!productsByOrder[p.styleOrderId]) productsByOrder[p.styleOrderId] = [];
    productsByOrder[p.styleOrderId].push(p);
  }

  // 3. Fetch users (active)
  const users = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.isActive, true));

  if (users.length === 0) {
    console.warn("⚠️ No active users found. Using fallback system user.");
  }

  // 4. Fetch unit types from reference table
  let unitTypes = await db
    .select({ name: unitTypesTable.name })
    .from(unitTypesTable)
    .where(eq(unitTypesTable.isActive, true));

  let unitTypeNames = unitTypes.map((u) => u.name);
  if (unitTypeNames.length === 0) {
    console.warn("⚠️ No unit types found in datatable. Using default list.");
    unitTypeNames = DEFAULT_UNIT_TYPES;
  }

  // 5. Scan for available images in style uploads directory
  const availableImageCodes = await scanAvailableStyleImageCodes();

  let artworkCounter = 1;
  let created = 0;
  const artworksToCreate: StyleOrderArtworkSeedData[] = [];

  // Calculate base artworks and extra artworks
  const totalOrders = styleOrders.length;
  const baseArtworksPerOrder = 1;
  const extraArtworks = Math.max(0, count - totalOrders);

  console.log(`   📊 Will create at least 1 artwork per order (${totalOrders} orders)`);
  if (extraArtworks > 0) {
    console.log(`   📊 Plus ${extraArtworks} additional artworks distributed randomly`);
  }

  // Helper to build artwork data for a given order and variation index
  const buildArtworkData = async (
    order: typeof styleOrders[0],
    variationIndex: number
  ): Promise<StyleOrderArtworkSeedData> => {
    // Get products for this order (if any)
    const orderProducts = productsByOrder[order.id] || [];

    // Decide whether to link to a product (60% chance if products exist)
    let linkedProduct = null;
    if (orderProducts.length > 0 && faker.datatype.boolean({ probability: 0.6 })) {
      linkedProduct = faker.helpers.arrayElement(orderProducts);
    }

    const isInhouse = faker.datatype.boolean({ probability: 0.7 });
    const workHours = faker.number.int({ min: 2, max: 40 }).toString();
    const hourlyRate = faker.number.int({ min: 50, max: 500 }).toString();
    const totalCost = (parseInt(workHours) * parseInt(hourlyRate)).toString();

    // Generate artwork name
    const artworkName = generateArtworkNameFromStyle(
      order.styleName,
      linkedProduct?.productName,
      variationIndex
    );

    // Load images if we have a code for this order
    let refImages: ImageItem[] = [];
    let wipImages: ImageItem[] = [];
    let finalImages: ImageItem[] = [];

    let orderCode: string | null = null;

    if (order.orderCode && availableImageCodes.has(order.orderCode)) {
      orderCode = order.orderCode;
    } else if (availableImageCodes.size > 0) {
      // Fallback: pick a random available code
      orderCode = faker.helpers.arrayElement(Array.from(availableImageCodes));
    }

    if (orderCode) {
      const images = await loadStyleArtworkImages(orderCode);
      refImages = images.refImages;
      wipImages = images.wipImages;
      finalImages = images.finalImages;
    }

    // Compute random date between orderIssueDate and deliveryDate
    const randomCreatedAt = getRandomDateBetween(order.orderIssueDate, order.deliveryDate);

    // Build base data
    const artworkData: StyleOrderArtworkSeedData = {
      styleOrderId: order.id,
      styleOrderProductId: linkedProduct?.id || null,
      styleOrderProductName: linkedProduct?.productName || null,
      artworkName: artworkName,
      unitLength: faker.number.int({ min: 10, max: 200 }).toString(),
      unitWidth: faker.number.int({ min: 10, max: 200 }).toString(),
      unitType: faker.helpers.arrayElement(unitTypeNames),
      artworkCreated: isInhouse ? "Inhouse" : "Outsourced",
      workHours: workHours,
      hourlyRate: hourlyRate,
      totalCost: totalCost,
      feedbackStatus: getRandomFeedbackStatus(),
      files: [],
      refImages: refImages,
      wipImages: wipImages,
      finalImages: finalImages,
      videos: [],
      createdBy: users.length > 0 ? faker.helpers.arrayElement(users).email : "system",
      createdAt: randomCreatedAt, 
    };

    // If outsourced, add outsource details
    if (!isInhouse) {
      artworkData.outsourceVendorId = faker.string.numeric(5);
      artworkData.outsourceVendorName =
        faker.company.name() + " " + faker.helpers.arrayElement(["Studio", "Designs", "Creations"]);
      artworkData.outsourcePaymentDate = faker.date.recent().toISOString().slice(0, 10);
      artworkData.outsourcePaymentAmount = faker.number.int({ min: 1000, max: 50000 }).toString();
      artworkData.outsourcePaymentMode = getRandomPaymentMode();
      artworkData.outsourceTransactionId = "TXN-" + faker.string.alphanumeric(8).toUpperCase();
      artworkData.outsourcePaymentStatus = getRandomPaymentStatus();
    }

    // Add toile details (with 70% probability)
    if (faker.datatype.boolean({ probability: 0.7 })) {
      artworkData.toileMakingCost = faker.number.int({ min: 500, max: 10000 }).toString();
      artworkData.toileVendorId = faker.string.numeric(5);
      artworkData.toileVendorName = faker.company.name() + " " + faker.helpers.arrayElement(["Toile", "Sample"]);
      artworkData.toileCost = faker.number.int({ min: 300, max: 8000 }).toString();
      artworkData.toilePaymentType = getRandomPaymentType();
      artworkData.toilePaymentDate = faker.date.recent().toISOString().slice(0, 10);
      artworkData.toilePaymentMode = getRandomPaymentMode();
      artworkData.toilePaymentStatus = getRandomPaymentStatus();
      artworkData.toilePaymentAmount = faker.number.int({ min: 500, max: 9000 }).toString();
      artworkData.toileTransactionId = "TXN-" + faker.string.alphanumeric(8).toUpperCase();
      artworkData.toileRemarks = faker.lorem.sentence();
      artworkData.toileImages = [
        {
          data: generatePlaceholderBase64(),
          name: "toile-sample.jpg",
          size: 0,
          type: "image/jpeg",
        },
      ];
    }

    // Add pattern details (with 70% probability)
    if (faker.datatype.boolean({ probability: 0.7 })) {
      artworkData.patternType = faker.helpers.arrayElement(["CAD", "Manual", "Digital", "Paper"]);
      artworkData.patternMakingCost = faker.number.int({ min: 1000, max: 15000 }).toString();
      artworkData.patternDoc = [
        {
          data: generatePlaceholderBase64(),
          name: "pattern-doc.pdf",
          size: 0,
          type: "application/pdf",
        },
      ];
      artworkData.patternOuthouseDoc = [
        {
          data: generatePlaceholderBase64(),
          name: "outhouse-pattern.pdf",
          size: 0,
          type: "application/pdf",
        },
      ];
      artworkData.patternVendorId = faker.string.numeric(5);
      artworkData.patternVendorName = faker.company.name() + " " + faker.helpers.arrayElement(["Pattern", "Tech"]);
      artworkData.patternPaymentType = getRandomPaymentType();
      artworkData.patternPaymentMode = getRandomPaymentMode();
      artworkData.patternPaymentStatus = getRandomPaymentStatus();
      artworkData.patternPaymentAmount = faker.number.int({ min: 1000, max: 12000 }).toString();
      artworkData.patternTransactionId = "TXN-" + faker.string.alphanumeric(8).toUpperCase();
      artworkData.patternPaymentDate = faker.date.recent().toISOString().slice(0, 10);
      artworkData.patternRemarks = faker.lorem.sentence();
    }

    return artworkData;
  };

  // FIRST PASS: Create exactly 1 artwork for every style order
  for (const order of styleOrders) {
    const artworkData = await buildArtworkData(order, 0);
    artworksToCreate.push(artworkData);
    created++;
  }

  // SECOND PASS: Distribute extra artworks randomly among orders
  if (extraArtworks > 0) {
    console.log(`   🎲 Distributing ${extraArtworks} extra artworks...`);

    // Create a pool of order IDs to distribute extra artworks
    const orderPool = styleOrders.map((order) => order.id);

    for (let i = 0; i < extraArtworks; i++) {
      // Pick a random order for this extra artwork
      const targetOrderId = faker.helpers.arrayElement(orderPool);
      const targetOrder = styleOrders.find((o) => o.id === targetOrderId);
      if (!targetOrder) continue;

      const artworkData = await buildArtworkData(targetOrder, i + 1);
      artworksToCreate.push(artworkData);
      created++;
    }
  }

  console.log(
    "\n📋 Generated " +
      artworksToCreate.length +
      " artworks for " +
      styleOrders.length +
      " style orders"
  );

  // Insert artworks sequentially
  for (const data of artworksToCreate) {
    const artworkCode = generateArtworkCode(artworkCounter);
    artworkCounter++;

    try {
      const [artwork] = await db
        .insert(styleOrderArtworksTable)
        .values({
          artworkCode: artworkCode,
          styleOrderId: data.styleOrderId,
          styleOrderProductId: data.styleOrderProductId ?? null,
          styleOrderProductName: data.styleOrderProductName ?? null,
          artworkName: data.artworkName,
          unitLength: data.unitLength ?? null,
          unitWidth: data.unitWidth ?? null,
          unitType: data.unitType ?? null,
          artworkCreated: data.artworkCreated ?? "Inhouse",
          workHours: data.workHours ?? null,
          hourlyRate: data.hourlyRate ?? null,
          totalCost: data.totalCost ?? null,
          outsourceVendorId: data.outsourceVendorId ?? null,
          outsourceVendorName: data.outsourceVendorName ?? null,
          outsourcePaymentDate: data.outsourcePaymentDate ?? null,
          outsourcePaymentAmount: data.outsourcePaymentAmount ?? null,
          outsourcePaymentMode: data.outsourcePaymentMode ?? null,
          outsourceTransactionId: data.outsourceTransactionId ?? null,
          outsourcePaymentStatus: data.outsourcePaymentStatus ?? null,
          toileMakingCost: data.toileMakingCost ?? null,
          toileVendorId: data.toileVendorId ?? null,
          toileVendorName: data.toileVendorName ?? null,
          toileCost: data.toileCost ?? null,
          toilePaymentType: data.toilePaymentType ?? null,
          toilePaymentDate: data.toilePaymentDate ?? null,
          toilePaymentMode: data.toilePaymentMode ?? null,
          toilePaymentStatus: data.toilePaymentStatus ?? null,
          toilePaymentAmount: data.toilePaymentAmount ?? null,
          toileTransactionId: data.toileTransactionId ?? null,
          toileRemarks: data.toileRemarks ?? null,
          toileImages: data.toileImages ?? [],
          patternType: data.patternType ?? null,
          patternMakingCost: data.patternMakingCost ?? null,
          patternDoc: data.patternDoc ?? [],
          patternOuthouseDoc: data.patternOuthouseDoc ?? [],
          patternVendorId: data.patternVendorId ?? null,
          patternVendorName: data.patternVendorName ?? null,
          patternPaymentType: data.patternPaymentType ?? null,
          patternPaymentMode: data.patternPaymentMode ?? null,
          patternPaymentStatus: data.patternPaymentStatus ?? null,
          patternPaymentAmount: data.patternPaymentAmount ?? null,
          patternTransactionId: data.patternTransactionId ?? null,
          patternPaymentDate: data.patternPaymentDate ?? null,
          patternRemarks: data.patternRemarks ?? null,
          feedbackStatus: data.feedbackStatus ?? "Pending",
          files: data.files ?? [],
          refImages: data.refImages ?? [],
          wipImages: data.wipImages ?? [],
          finalImages: data.finalImages ?? [],
          videos: data.videos ?? [],
          createdBy: data.createdBy || "system",
          createdAt: data.createdAt || new Date(), // <-- use computed or fallback
        })
        .returning();

      console.log(
        "✅ Created artwork: " +
          artworkCode +
          " - " +
          data.artworkName +
          " (Style Order: " +
          data.styleOrderId +
          ")"
      );
    } catch (error) {
      console.error("❌ Failed to create artwork: " + data.artworkName, error);
    }
  }

  console.log(
    "\n✅ StyleOrderArtworkSeeder completed! Created " +
      artworksToCreate.length +
      " artworks for " +
      styleOrders.length +
      " style orders."
  );
}


// Self-execution for ESM


const isMainModule = import.meta.url === "file://" + process.argv[1];

if (isMainModule) {
  const count = parseInt(process.argv[2]) || 100;
  seedStyleOrderArtworks(count).catch(console.error);
}