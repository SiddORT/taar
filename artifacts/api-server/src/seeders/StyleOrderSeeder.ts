// scripts/seed-style-orders.ts
// Run with: npx tsx scripts/seed-style-orders.ts [count]

import "dotenv/config";
import { db, eq, and, sql } from "@workspace/db";
import { faker } from "@faker-js/faker";
import {
  styleOrdersTable,
  entityTagsTable,
  clientsTable,
  departmentsTable,
  swatchesTable,
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

type Status = 'Draft' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

interface ReferenceItem {
  id: string;
  label: string;
  remark?: string;
}

interface EstimateItem {
  id: string;
  label: string;
  rate: string;
  isCustom: boolean;
}

interface ImageItem {
  data: string;
  name: string;
  size: number;
  type: string;
}

interface Client {
  id: number;
  clientCode: string;
  brandName: string;
}

interface Department {
  id: number;
  name: string;
}

interface StyleOrderRef {
  id: number;
  orderCode: string;
  styleName: string;
}

interface SwatchRef {
  id: number;
  swatchCode: string;
  swatchName: string;
}

// ============================================================
// IMAGE HELPERS (identical to swatch seeder)
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
// LOAD REAL IMAGES FOR A STYLE ORDER
// ============================================================

async function loadStyleImages(orderCode: string): Promise<{
  refImages: ImageItem[];
  wipImages: ImageItem[];
  finalImages: ImageItem[];
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

  console.log(`  📂 Resolving images from: ${baseDir}`);

  // WIP
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

  // Final
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

  // Reference
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

  // Fallback: if any category is empty, fill with placeholders
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
// DATA GENERATION HELPERS
// ============================================================

function getRandomPriority(): Priority {
  return faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Urgent']);
}

function getRandomStatus(): Status {
  const statuses: Status[] = ['Draft', 'Pending', 'In Progress', 'Completed', 'Cancelled'];
  // Weight toward In Progress and Completed
  return faker.helpers.arrayElement([
    ...statuses,
    'In Progress', 'In Progress',
    'Completed', 'Completed',
  ]);
}

function getRandomDepartment(departments: Department[]): string | null {
  if (departments.length === 0) return null;
  if (faker.number.int({ min: 0, max: 10 }) < 2) return null;
  return faker.helpers.arrayElement(departments).name;
}

function getRandomIssuedTo(): string | null {
  return faker.helpers.arrayElement([
    'Design Team', 'Production', 'Sampling', 'Quality Control',
    'Senior Designer', 'Production Manager', null
  ]);
}

function getRandomSeason(): string | null {
  return faker.helpers.arrayElement([
    'Spring/Summer 2025', 'Fall/Winter 2025', 'Spring/Summer 2026',
    'Pre-Fall 2025', 'Holiday 2025', null
  ]);
}

function getRandomColorway(): string | null {
  return faker.helpers.arrayElement([
    'Ivory', 'Blush', 'Sapphire', 'Emerald', 'Charcoal',
    'Burgundy', 'Terracotta', 'Navy', 'Rose Gold', null
  ]);
}

function getRandomSampleSize(): string | null {
  return faker.helpers.arrayElement([
    'S', 'M', 'L', 'XL', 'One Size', 'Custom', null
  ]);
}

function getRandomFabricType(): string | null {
  return faker.helpers.arrayElement([
    'Silk Charmeuse', 'Georgette', 'Chiffon', 'Cotton Poplin', 'Linen',
    'Denim', 'Velvet', 'Organza', 'Crepe', 'Satin', 'Jacquard',
    'Twill', 'Modal', 'Rayon', 'Tencel', 'Fleece', 'Lycra Blend', null
  ]);
}

// ✅ NEW: Generate date within ±3 months from today
function generateDate(): string {
  const now = new Date();
  const past3Months = new Date(now);
  past3Months.setMonth(now.getMonth() - 3);
  const future3Months = new Date(now);
  future3Months.setMonth(now.getMonth() + 3);
  return faker.date.between({ from: past3Months, to: future3Months }).toISOString().slice(0, 10);
}

// ✅ Helper to add days to a date string
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function generateTargetHours(): string | null {
  return faker.helpers.maybe(() => faker.number.int({ min: 4, max: 120 }).toString(), { probability: 0.6 }) || null;
}

// ============================================================
// REFERENCE GENERATION (matches exact formats)
// ============================================================

const REFERENCE_REMARKS = [
  'Refer to this style for silhouette.',
  'Match the sleeve detailing.',
  'Client approved this neckline previously.',
  'Use similar construction method.',
  'This reference is for the collar only.',
  'Client liked the drape on this one.',
];

function generateStyleReferences(styles: StyleOrderRef[]): ReferenceItem[] {
  if (styles.length === 0) return [];
  const count = faker.number.int({ min: 1, max: Math.min(3, styles.length) });
  const selected = faker.helpers.arrayElements(styles, count);
  return selected.map((s) => ({
    id: 'swo:' + s.id,
    label: (s.orderCode || '') + ' – ' + s.styleName,
    remark: faker.helpers.maybe(() => faker.helpers.arrayElement(REFERENCE_REMARKS), { probability: 0.3 }) || '',
  }));
}

function generateSwatchReferences(swatches: SwatchRef[]): ReferenceItem[] {
  if (swatches.length === 0) return [];
  const count = faker.number.int({ min: 1, max: Math.min(2, swatches.length) });
  const selected = faker.helpers.arrayElements(swatches, count);
  return selected.map((s) => ({
    id: String(s.id),
    label: (s.swatchCode || '') + ' – ' + s.swatchName,
    remark: faker.helpers.maybe(() => faker.helpers.arrayElement(REFERENCE_REMARKS), { probability: 0.2 }) || '',
  }));
}

// ============================================================
// ESTIMATE GENERATION
// ============================================================

function generateEstimate(): EstimateItem[] {
  const estimateItems = [
    { id: 'sampling', label: 'Sampling', isCustom: false },
    { id: 'artwork', label: 'Artwork', isCustom: false },
    { id: 'material', label: 'Material', isCustom: false },
    { id: 'embroidery', label: 'Embroidery', isCustom: false },
    { id: 'fabric', label: 'Fabric', isCustom: false },
    { id: 'qc', label: 'QC', isCustom: false },
    { id: 'travel', label: 'Travel', isCustom: false },
    { id: 'overheads', label: 'Overheads', isCustom: false },
  ];
  return estimateItems.map((item) => ({
    ...item,
    rate: faker.helpers.maybe(() => faker.number.int({ min: 100, max: 5000 }).toString(), { probability: 0.5 }) || '',
  }));
}

// ============================================================
// TAG GENERATION
// ============================================================

function generateStyleTags(styleName: string, fabricType: string | null, season: string | null): string[] {
  const tags: string[] = [];
  const words = styleName.toLowerCase().split(' ');
  for (const word of words) {
    if (word.length > 2) tags.push(word);
  }
  if (fabricType) {
    const fabricWords = fabricType.toLowerCase().split(' ');
    for (const word of fabricWords) {
      if (word.length > 2) tags.push(word);
    }
  }
  if (season) {
    const seasonWords = season.toLowerCase().split(/[\s/]+/);
    for (const word of seasonWords) {
      if (word.length > 2) tags.push(word);
    }
  }
  const generic = ['fashion', 'apparel', 'garment', 'design', 'luxury', 'premium', 'handcrafted'];
  const count = faker.number.int({ min: 1, max: 3 });
  for (let i = 0; i < count; i++) {
    const g = faker.helpers.arrayElement(generic);
    if (!tags.includes(g)) tags.push(g);
  }
  const unique = [...new Set(tags)];
  return faker.helpers.arrayElements(unique, Math.min(unique.length, 6));
}

// ============================================================
// ORDER CODE GENERATION
// ============================================================

async function generateOrderCode(clientId: string | null): Promise<string> {
  let prefix = 'CL';
  if (clientId) {
    const client = await db
      .select({ clientCode: clientsTable.clientCode })
      .from(clientsTable)
      .where(and(eq(clientsTable.id, Number(clientId)), eq(clientsTable.isDeleted, false)))
      .limit(1);
    if (client.length > 0) {
      prefix = client[0].clientCode;
    }
  }
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(styleOrdersTable)
    .where(
      clientId ? eq(styleOrdersTable.clientId, clientId) : sql`1=1`
    );
  const count = result[0]?.count || 0;
  const sequence = String(count + 1).padStart(4, '0');
  return prefix + '-ZSTY-' + sequence;
}

// ============================================================
// MAIN SEEDER
// ============================================================

export async function seedStyleOrders(count: number = 50): Promise<void> {
  console.log(`\n🌱 Starting StyleOrderSeeder with ${count} orders...\n`);

  // Fetch related data
  console.log('📊 Fetching related data from database...');

  const clients = await db
    .select({ id: clientsTable.id, clientCode: clientsTable.clientCode, brandName: clientsTable.brandName })
    .from(clientsTable)
    .where(and(eq(clientsTable.isActive, true), eq(clientsTable.isDeleted, false)));
  console.log(`   Found ${clients.length} clients`);

  const departments = await db
    .select({ id: departmentsTable.id, name: departmentsTable.name })
    .from(departmentsTable)
    .where(and(eq(departmentsTable.isActive, true), eq(departmentsTable.isDeleted, false)));
  console.log(`   Found ${departments.length} departments`);

  const existingStyles = await db
    .select({ id: styleOrdersTable.id, orderCode: styleOrdersTable.orderCode, styleName: styleOrdersTable.styleName })
    .from(styleOrdersTable)
    .where(eq(styleOrdersTable.isDeleted, false));
  console.log(`   Found ${existingStyles.length} existing style orders for references`);

  const swatches = await db
    .select({ id: swatchesTable.id, swatchCode: swatchesTable.swatchCode, swatchName: swatchesTable.swatchName })
    .from(swatchesTable)
    .where(and(eq(swatchesTable.isActive, true), eq(swatchesTable.isDeleted, false)));
  console.log(`   Found ${swatches.length} swatches for references`);

  if (clients.length === 0) {
    console.warn('⚠️ No clients found. Orders will be created without client association.');
  }
  if (departments.length === 0) {
    console.warn('⚠️ No departments found. Orders will be created without department association.');
  }

  let created = 0;
  for (let i = 0; i < count; i++) {
    const client = clients.length > 0 ? faker.helpers.arrayElement(clients) : null;
    const clientId = client ? String(client.id) : null;
    const clientName = client ? client.brandName : null;

    // Generate orderIssueDate within ±3 months
    const orderIssueDate = generateDate();
    const status = getRandomStatus();
    const isChargeable = faker.datatype.boolean({ probability: 0.7 });
    const isInhouse = faker.datatype.boolean({ probability: 0.3 });

    const styleName = faker.commerce.productName() + ' ' + faker.helpers.arrayElement(['Dress', 'Blouse', 'Jacket', 'Skirt', 'Shirt', 'Kurta', 'Saree', 'Lehenga']);
    const styleNo = faker.helpers.maybe(() => faker.string.alphanumeric(8).toUpperCase(), { probability: 0.7 }) || '';
    const fabricType = getRandomFabricType();
    const season = getRandomSeason();
    const colorway = getRandomColorway();
    const sampleSize = getRandomSampleSize();
    const department = getRandomDepartment(departments);
    const issuedTo = getRandomIssuedTo();
    const quantity = faker.helpers.maybe(() => faker.number.int({ min: 1, max: 100 }).toString(), { probability: 0.8 }) || null;
    const priority = getRandomPriority();
    const targetHours = generateTargetHours();

    const styleReferences = generateStyleReferences(existingStyles);
    const swatchReferences = generateSwatchReferences(swatches);
    const estimate = generateEstimate();
    const tags = generateStyleTags(styleName, fabricType, season);

    // Generate dates based on status, all within the ±3 months window
    let approvalDate = null;
    let actualStartDate = null;
    let actualStartTime = null;
    let actualCompletionDate = null;
    let actualCompletionTime = null;
    let tentativeDeliveryDate = null;
    let delayReason = null;
    let cancelReason = null;
    let deliveryDate = addDays(orderIssueDate, faker.number.int({ min: 7, max: 60 }));

    if (status === 'Completed') {
      approvalDate = addDays(orderIssueDate, faker.number.int({ min: 1, max: 7 }));
      const startBase = new Date(approvalDate);
      actualStartDate = addDays(approvalDate, faker.number.int({ min: 1, max: 3 }));
      actualStartTime = faker.helpers.maybe(() => faker.date.recent().toTimeString().slice(0,5), { probability: 0.7 }) || '';
      actualCompletionDate = addDays(actualStartDate, faker.number.int({ min: 5, max: 15 }));
      actualCompletionTime = faker.helpers.maybe(() => faker.date.recent().toTimeString().slice(0,5), { probability: 0.7 }) || '';
      deliveryDate = addDays(actualCompletionDate, faker.number.int({ min: 1, max: 5 }));
      tentativeDeliveryDate = deliveryDate;
      delayReason = faker.helpers.maybe(() => faker.helpers.arrayElement(['Fabric delay', 'Artwork revision', 'Machine breakdown']), { probability: 0.3 }) || null;
    } else if (status === 'In Progress') {
      approvalDate = addDays(orderIssueDate, faker.number.int({ min: 1, max: 5 }));
      actualStartDate = addDays(approvalDate, faker.number.int({ min: 1, max: 3 }));
      actualStartTime = faker.helpers.maybe(() => faker.date.recent().toTimeString().slice(0,5), { probability: 0.7 }) || '';
      tentativeDeliveryDate = addDays(actualStartDate, faker.number.int({ min: 5, max: 30 }));
      deliveryDate = tentativeDeliveryDate || addDays(orderIssueDate, 30);
      delayReason = faker.helpers.maybe(() => faker.helpers.arrayElement(['Fabric delay', 'Artwork revision']), { probability: 0.3 }) || null;
    } else if (status === 'Pending') {
      approvalDate = faker.helpers.maybe(() => addDays(orderIssueDate, faker.number.int({ min: 1, max: 3 })), { probability: 0.5 }) || null;
      deliveryDate = addDays(orderIssueDate, faker.number.int({ min: 10, max: 30 }));
    } else if (status === 'Draft') {
      deliveryDate = addDays(orderIssueDate, faker.number.int({ min: 15, max: 45 }));
    } else if (status === 'Cancelled') {
      cancelReason = faker.helpers.arrayElement(['Client cancelled', 'Budget issues', 'Design not approved', 'Production problems']);
      deliveryDate = addDays(orderIssueDate, faker.number.int({ min: 5, max: 15 }));
    }

    const orderCode = await generateOrderCode(clientId);
    const { refImages, wipImages, finalImages } = await loadStyleImages(orderCode);

    try {
      await db.transaction(async (tx) => {
        const [order] = await tx.insert(styleOrdersTable).values({
          orderCode,
          styleName,
          styleNo: styleNo || null,
          clientId: clientId,
          clientName: clientName,
          quantity: quantity,
          priority: priority,
          orderStatus: status,
          season: season,
          colorway: colorway,
          sampleSize: sampleSize,
          fabricType: fabricType,
          orderIssueDate: orderIssueDate,
          deliveryDate: deliveryDate,
          targetHours: targetHours,
          issuedTo: issuedTo,
          department: department,
          description: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }) || null,
          internalNotes: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.3 }) || null,
          clientInstructions: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || null,
          isChargeable: isChargeable,
          isInhouse: isInhouse,
          styleReferences: styleReferences,
          swatchReferences: swatchReferences,
          refDocs: [],
          refImages: refImages,
          wipImages: wipImages,
          finalImages: finalImages,
          wipVideos: [],
          finalVideos: [],
          estimate: estimate,
          actualStartDate: actualStartDate,
          actualStartTime: actualStartTime,
          tentativeDeliveryDate: tentativeDeliveryDate,
          actualCompletionDate: actualCompletionDate,
          actualCompletionTime: actualCompletionTime,
          delayReason: delayReason,
          cancelReason: cancelReason,
          approvalDate: approvalDate,
          revisionCount: faker.number.int({ min: 0, max: 5 }),
          createdBy: faker.helpers.arrayElement(['admin@taar.com', 'system']),
          updatedBy: faker.helpers.arrayElement(['admin@taar.com', 'system']),
          createdAt: new Date(),
        }).returning();

        if (tags.length > 0 && order) {
          const tagValues = tags.map((tag) => ({
            entityType: 'style_order',
            entityId: order.id,
            tag: tag,
          }));
          await tx.insert(entityTagsTable).values(tagValues).onConflictDoNothing();
        }

        console.log(`✅ Created style order: ${styleName} (Code: ${orderCode}, ID: ${order?.id})`);
      });
      created++;
    } catch (error) {
      console.error(`❌ Failed to create style order ${i+1}:`, error);
    }

    if ((i + 1) % 10 === 0) {
      console.log(`📦 Progress: ${i+1}/${count} orders processed`);
    }
  }

  console.log(`\n✅ StyleOrderSeeder completed! Created ${created}/${count} orders.`);
}

// ============================================================
// SELF-EXECUTION
// ============================================================

const isMainModule = import.meta.url === 'file://' + process.argv[1];
if (isMainModule) {
  const count = parseInt(process.argv[2]) || 50;
  seedStyleOrders(count).catch(console.error);
}