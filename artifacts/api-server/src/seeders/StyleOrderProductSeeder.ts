// scripts/seed-style-order-products.ts
// Run: npx tsx scripts/seed-style-order-products.ts [count]  (optional: number of style orders to process; omit to process all)

import "dotenv/config";
import { db, eq, and, sql } from "@workspace/db";
import { faker } from "@faker-js/faker";
import {
  styleOrderProductsTable,
  styleOrdersTable,
  styleCategoriesTable,
  fabricsTable,
  unitTypesTable,
  departmentsTable,
  usersTable, // ✅ Import users table
} from "@workspace/db";
import fs from "fs-extra";
import path from "path";

// ============================================================
// CONFIGURATION
// ============================================================

const STYLE_UPLOADS_DIR = process.env.STYLE_UPLOADS_DIR
  ? path.resolve(process.env.STYLE_UPLOADS_DIR)
  : path.join(process.cwd(), "uploads", "styles");

// ============================================================
// TYPES
// ============================================================

interface StyleOrderRef {
  id: number;
  orderCode: string;
  styleName: string;
}

interface StyleCategory {
  id: number;
  categoryName: string;
}

interface Fabric {
  id: number;
  fabricCode: string;
  fabricType: string;
  quality: string;
  colorName: string;
}

interface UnitType {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

type ProductStatus = 'Draft' | 'In Progress' | 'Completed' | 'Cancelled';
type PatternPaymentStatus = 'Pending' | 'Paid' | 'Partial';

interface ImageItem {
  data: string;
  name: string;
  size: number;
  type: string;
}

// ============================================================
// IMAGE HELPER FUNCTIONS (copied from style orders seeder)
// ============================================================

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'image/png';
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
    const base64 = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);
    return 'data:' + mimeType + ';base64,' + base64;
  } catch {
    return generatePlaceholderBase64();
  }
}

function generatePlaceholderBase64(): string {
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
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

// ============================================================
// LOAD STYLE IMAGES (wip, final, reference) from style folder
// ============================================================

async function loadStyleImages(orderCode: string): Promise<{
  wipImages: ImageItem[];
  finalImages: ImageItem[];
  refImages: ImageItem[];
}> {
  const baseDir = path.join(STYLE_UPLOADS_DIR, orderCode);
  const wipDir = path.join(baseDir, 'wip');
  const finalDir = path.join(baseDir, 'final');
  const refDir = path.join(baseDir, 'reference');

  const result = {
    wipImages: [] as ImageItem[],
    finalImages: [] as ImageItem[],
    refImages: [] as ImageItem[],
  };

  // Load WIP
  if (await fs.pathExists(wipDir)) {
    const files = await readImageFiles(wipDir);
    for (const file of files) {
      const filePath = path.join(wipDir, file);
      const base64 = await imageToBase64(filePath);
      const size = await getFileSize(filePath);
      result.wipImages.push({
        data: base64,
        name: file,
        size,
        type: getMimeType(filePath),
      });
    }
  }

  // Load Final
  if (await fs.pathExists(finalDir)) {
    const files = await readImageFiles(finalDir);
    for (const file of files) {
      const filePath = path.join(finalDir, file);
      const base64 = await imageToBase64(filePath);
      const size = await getFileSize(filePath);
      result.finalImages.push({
        data: base64,
        name: file,
        size,
        type: getMimeType(filePath),
      });
    }
  }

  // Load Reference
  if (await fs.pathExists(refDir)) {
    const files = await readImageFiles(refDir);
    for (const file of files) {
      const filePath = path.join(refDir, file);
      const base64 = await imageToBase64(filePath);
      const size = await getFileSize(filePath);
      result.refImages.push({
        data: base64,
        name: file,
        size,
        type: getMimeType(filePath),
      });
    }
  }

  // Fallback: ensure at least 2 images for each category (use placeholders if missing)
  const placeholder = generatePlaceholderBase64();
  if (result.wipImages.length === 0) {
    result.wipImages = [
      { data: placeholder, name: 'WIP Placeholder 1', size: 0, type: 'image/png' },
      { data: placeholder, name: 'WIP Placeholder 2', size: 0, type: 'image/png' },
    ];
  }
  if (result.finalImages.length === 0) {
    result.finalImages = [
      { data: placeholder, name: 'Final Placeholder 1', size: 0, type: 'image/png' },
      { data: placeholder, name: 'Final Placeholder 2', size: 0, type: 'image/png' },
    ];
  }
  if (result.refImages.length === 0) {
    result.refImages = [
      { data: placeholder, name: 'Reference Placeholder 1', size: 0, type: 'image/png' },
      { data: placeholder, name: 'Reference Placeholder 2', size: 0, type: 'image/png' },
    ];
  }

  return result;
}

// ============================================================
// DOCUMENT / VIDEO PLACEHOLDERS
// ============================================================

function createPlaceholderDoc(name: string): { data: string; name: string; size: number; type: string } {
  return {
    data: generatePlaceholderBase64(),
    name,
    size: 0,
    type: 'application/pdf',
  };
}

function createPlaceholderVideo(name: string): { data: string; name: string; size: number; type: string } {
  return {
    data: generatePlaceholderBase64(),
    name,
    size: 0,
    type: 'video/mp4',
  };
}

// ============================================================
// HELPERS FOR PRODUCT DATA
// ============================================================

function getRandomProductStatus(): ProductStatus {
  const statuses: ProductStatus[] = ['Draft', 'In Progress', 'Completed', 'Cancelled'];
  return faker.helpers.arrayElement([
    ...statuses,
    'In Progress', 'In Progress',
    'Completed', 'Completed',
  ]);
}

function getRandomPatternPaymentStatus(): PatternPaymentStatus {
  return faker.helpers.arrayElement(['Pending', 'Paid', 'Partial']);
}

function getRandomIssuedTo(): string | null {
  return faker.helpers.arrayElement([
    'Design Team',
    'Production',
    'Sampling',
    'Quality Control',
    'Senior Designer',
    'Production Manager',
    null,
  ]);
}

function generateDate(): string {
  return faker.date.future({ years: 1 }).toISOString().slice(0, 10);
}

function generateTargetHours(): string | null {
  return faker.helpers.maybe(() => faker.number.int({ min: 4, max: 120 }).toString(), { probability: 0.6 }) || null;
}

function generatePatternType(): string | null {
  return faker.helpers.arrayElement([
    'Basic Block',
    'Modified Block',
    'Grading',
    'Marker Making',
    'Drape',
    null,
  ]);
}

function generatePaymentAmount(): string | null {
  return faker.helpers.maybe(() => faker.number.int({ min: 500, max: 50000 }).toString(), { probability: 0.5 }) || null;
}

// ============================================================
// MAIN SEEDER
// ============================================================

export async function seedStyleOrderProducts(ordersToProcess: number = 0): Promise<void> {
  console.log(`\n🧵 Starting StyleOrderProductSeeder...`);

  // ------------------------------------------------------------
  // Fetch related data
  // ------------------------------------------------------------

  console.log('📊 Fetching related data from database...');

  // Fetch actual users
  let usernames: string[] = [];
  try {
    const users = await db
      .select({ username: usersTable.username })
      .from(usersTable)
      .where(eq(usersTable.isActive, true)); // assumes an `isActive` column; if not, remove `.where(...)`
    usernames = users.map(u => u.username);
    console.log(`   ✅ Found ${usernames.length} active users`);
  } catch (error) {
    console.warn('   ⚠️ Could not fetch users, falling back to hardcoded list.');
  }

  // Fallback if no users found or query failed
  if (usernames.length === 0) {
    usernames = ['admin@taar.com', 'system'];
    console.log('   ℹ️ Using fallback user list:', usernames.join(', '));
  }

  // Build base query for style orders
  const baseQuery = db
    .select({
      id: styleOrdersTable.id,
      orderCode: styleOrdersTable.orderCode,
      styleName: styleOrdersTable.styleName,
    })
    .from(styleOrdersTable)
    .where(eq(styleOrdersTable.isDeleted, false));

  // Conditionally apply limit using ternary – avoids TypeScript reassignment errors
  const styleOrdersQuery = ordersToProcess > 0 ? baseQuery.limit(ordersToProcess) : baseQuery;
  const styleOrders = await styleOrdersQuery;

  const totalOrders = styleOrders.length;
  console.log(`   ✅ Found ${totalOrders} style orders to process`);

  if (styleOrders.length === 0) {
    console.log('⚠️ No style orders found. Exiting.');
    return;
  }

  const styleCategories = await db
    .select({ id: styleCategoriesTable.id, categoryName: styleCategoriesTable.categoryName })
    .from(styleCategoriesTable)
    .where(and(eq(styleCategoriesTable.isActive, true), eq(styleCategoriesTable.isDeleted, false)));

  console.log(`   ✅ Found ${styleCategories.length} style categories`);

  const fabrics = await db
    .select({
      id: fabricsTable.id,
      fabricCode: fabricsTable.fabricCode,
      fabricType: fabricsTable.fabricType,
      quality: fabricsTable.quality,
      colorName: fabricsTable.colorName,
    })
    .from(fabricsTable)
    .where(and(eq(fabricsTable.isActive, true), eq(fabricsTable.isDeleted, false)));

  console.log(`   ✅ Found ${fabrics.length} fabrics`);

  const unitTypes = await db
    .select({ id: unitTypesTable.id, name: unitTypesTable.name })
    .from(unitTypesTable)
    .where(and(eq(unitTypesTable.isActive, true), eq(unitTypesTable.isDeleted, false)));

  console.log(`   ✅ Found ${unitTypes.length} unit types`);

  const departments = await db
    .select({ id: departmentsTable.id, name: departmentsTable.name })
    .from(departmentsTable)
    .where(and(eq(departmentsTable.isActive, true), eq(departmentsTable.isDeleted, false)));

  console.log(`   ✅ Found ${departments.length} departments`);

  if (styleCategories.length === 0) console.warn('⚠️ No style categories found.');
  if (fabrics.length === 0) console.warn('⚠️ No fabrics found.');
  if (unitTypes.length === 0) console.warn('⚠️ No unit types found.');
  if (departments.length === 0) console.warn('⚠️ No departments found.');

  // ------------------------------------------------------------
  // Generate products for each style order
  // ------------------------------------------------------------

  let totalCreated = 0;

  for (const styleOrder of styleOrders) {
    // Load images for this style order
    const styleImages = await loadStyleImages(styleOrder.orderCode);

    // Combine all images (wip, final, ref) into one pool for product reference images
    const allImages = [
      ...styleImages.wipImages,
      ...styleImages.finalImages,
      ...styleImages.refImages,
    ];

    const productsCount = faker.number.int({ min: 1, max: 3 });
    console.log(`\n📦 Processing style order: ${styleOrder.orderCode} (ID: ${styleOrder.id}) – generating ${productsCount} products`);

    for (let i = 0; i < productsCount; i++) {
      // Pick random references
      const category = styleCategories.length > 0 ? faker.helpers.arrayElement(styleCategories) : null;
      const fabric = fabrics.length > 0 ? faker.helpers.arrayElement(fabrics) : null;
      const unitType = unitTypes.length > 0 ? faker.helpers.arrayElement(unitTypes) : null;
      const department = departments.length > 0 ? faker.helpers.arrayElement(departments) : null;

      const hasLining = faker.datatype.boolean({ probability: 0.4 });
      const liningFabric = hasLining && fabrics.length > 0 ? faker.helpers.arrayElement(fabrics) : null;

      const orderIssueDate = generateDate();
      const deliveryDate = faker.date.future({ years: 1, refDate: orderIssueDate }).toISOString().slice(0, 10);
      const productStatus = getRandomProductStatus();
      const patternPaymentStatus = getRandomPatternPaymentStatus();

      // ------------------------------------------------------------
      // Select 2–3 random images from the style's image pool for ref_images
      // ------------------------------------------------------------
      const imageCount = Math.min(allImages.length, faker.number.int({ min: 2, max: 3 }));
      const selectedImages = faker.helpers.arrayElements(allImages, imageCount);

      // Videos: placeholder
      const videos = [createPlaceholderVideo('product_video_1.mp4')];

      // Documents: placeholder
      const refDocs = [createPlaceholderDoc('tech_sheet.pdf')];
      const patternDoc = [createPlaceholderDoc('pattern_1.dxf'), createPlaceholderDoc('pattern_2.pdf')];
      const patternOuthouseDoc = faker.helpers.maybe(() => [createPlaceholderDoc('outhouse_1.pdf')], { probability: 0.3 }) || [];

      // Pick random users for createdBy and updatedBy
      const createdBy = faker.helpers.arrayElement(usernames);
      const updatedBy = faker.helpers.arrayElement(usernames);

      // Build the product object
      const productData = {
        styleOrderId: styleOrder.id,
        productName: faker.commerce.productName() + ' ' + faker.helpers.arrayElement(['Dress', 'Blouse', 'Jacket', 'Skirt', 'Pants', 'Shirt']),
        styleCategoryId: category ? String(category.id) : null,
        styleCategoryName: category ? category.categoryName : null,
        productStatus: productStatus,
        fabricId: fabric ? String(fabric.id) : null,
        fabricName: fabric ? `${fabric.fabricCode} – ${fabric.quality} (${fabric.colorName})` : null,
        hasLining: hasLining,
        liningFabricId: liningFabric ? String(liningFabric.id) : null,
        liningFabricName: liningFabric ? `${liningFabric.fabricCode} – ${liningFabric.quality} (${liningFabric.colorName})` : null,
        unitLength: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 100 }).toString(), { probability: 0.8 }) || null,
        unitWidth: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 100 }).toString(), { probability: 0.8 }) || null,
        unitType: unitType ? unitType.name : null,
        orderIssueDate: orderIssueDate,
        deliveryDate: deliveryDate,
        targetHours: generateTargetHours(),
        issuedTo: getRandomIssuedTo(),
        department: department ? String(department.id) : null,
        refDocs: refDocs,
        refImages: selectedImages,  // ✅ Real images from style folder
        videos: videos,            // Placeholder video
        patternType: generatePatternType(),
        patternMakingCost: faker.helpers.maybe(() => faker.number.int({ min: 100, max: 5000 }).toString(), { probability: 0.4 }) || null,
        patternDoc: patternDoc,
        patternOuthouseDoc: patternOuthouseDoc,
        patternVendorId: faker.helpers.maybe(() => faker.string.alphanumeric(6).toUpperCase(), { probability: 0.3 }) || null,
        patternVendorName: faker.helpers.maybe(() => faker.company.name(), { probability: 0.3 }) || null,
        patternPaymentType: faker.helpers.maybe(() => faker.helpers.arrayElement(['Cash', 'Bank Transfer', 'Cheque']), { probability: 0.3 }) || null,
        patternPaymentMode: faker.helpers.maybe(() => faker.helpers.arrayElement(['Online', 'Offline', 'UPI']), { probability: 0.3 }) || null,
        patternPaymentStatus: patternPaymentStatus,
        patternPaymentAmount: generatePaymentAmount(),
        patternTransactionId: faker.helpers.maybe(() => faker.string.alphanumeric(12).toUpperCase(), { probability: 0.3 }) || null,
        patternPaymentDate: faker.helpers.maybe(() => faker.date.past().toISOString().slice(0, 10), { probability: 0.3 }) || null,
        patternRemarks: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) || null,
        createdBy: createdBy,
        updatedBy: updatedBy,
        createdAt: new Date(),
      };

      try {
        const [product] = await db.insert(styleOrderProductsTable).values(productData).returning();
        console.log(`   ✅ Created product: ${productData.productName} (ID: ${product.id}) with ${selectedImages.length} images from style folder`);
        totalCreated++;
      } catch (error) {
        console.error(`   ❌ Failed to create product:`, error);
      }
    }
  }

  console.log(`\n✅ StyleOrderProductSeeder completed! Created ${totalCreated} products across ${styleOrders.length} style orders.`);
}

// ============================================================
// SELF-EXECUTION
// ============================================================

const isMainModule = import.meta.url === 'file://' + process.argv[1];
if (isMainModule) {
  // If a number is passed as argument, use it; otherwise process ALL style orders (0 means all)
  const count = parseInt(process.argv[2]) || 0;
  seedStyleOrderProducts(count).catch(console.error);
}