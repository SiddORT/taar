import { db, eq, and, sql } from "@workspace/db";
import { faker } from "@faker-js/faker";
import {
  swatchOrdersTable,
  entityTagsTable,
  fabricsTable,
  swatchesTable,
  clientsTable,
  styleOrdersTable,
  unitTypesTable,
  departmentsTable,
} from "@workspace/db";
import fs from "fs-extra";
import path from "path";

// ============================================
// Types
// ============================================

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

interface Fabric {
  id: number;
  fabricCode: string;
  fabricType: string;
  quality: string;
  colorName: string;
}

interface Style {
  id: number;
  name: string;
  styleNo: string | null;
}

interface Swatch {
  id: number;
  swatchCode: string;
  swatchName: string;
}

interface Client {
  id: number;
  brandName: string;
  clientCode: string;
}

interface UnitType {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface SwatchOrderSeedData {
  swatchName: string;
  clientId: string | null;
  clientName: string | null;
  isChargeable: boolean;
  isInhouse: boolean;
  quantity: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  orderStatus: 'Draft' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  styleReferences: ReferenceItem[];
  swatchReferences: ReferenceItem[];
  fabricId: string | null;
  fabricName: string | null;
  hasLining: boolean;
  liningFabricId: string | null;
  liningFabricName: string | null;
  unitLength: string | null;
  unitWidth: string | null;
  unitType: string | null;
  orderIssueDate: string | null;
  deliveryDate: string | null;
  targetHours: string | null;
  issuedTo: string | null;
  department: string | null;
  description: string | null;
  internalNotes: string | null;
  clientInstructions: string | null;
  refDocs: object[];
  refImages: ImageItem[];
  wipImages: ImageItem[];
  finalImages: ImageItem[];
  wipVideos: object[];
  finalVideos: object[];
  estimate: EstimateItem[];
  actualStartDate: string | null;
  actualStartTime: string | null;
  tentativeDeliveryDate: string | null;
  actualCompletionDate: string | null;
  actualCompletionTime: string | null;
  delayReason: string | null;
  cancelReason: string | null;
  approvalDate: string | null;
  revisionCount: number;
  createdBy: string;
  updatedBy: string;
  tags?: string[];
}

// ============================================
// Image directory config
// ============================================

const SWATCH_UPLOADS_DIR =
  process.env.SWATCH_UPLOADS_DIR || path.join(process.cwd(), "uploads", "swatches");

// ============================================
// Base64 Image Helper Functions
// ============================================

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
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
  } catch (error) {
    console.warn('Could not read image: ' + imagePath);
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

async function scanAvailableSwatchImageCodes(): Promise<Set<string>> {
  const available = new Set<string>();

  console.log('\n🔎 Scanning for downloaded swatch images in: ' + SWATCH_UPLOADS_DIR);

  if (!(await fs.pathExists(SWATCH_UPLOADS_DIR))) {
    console.warn('  ⚠️ Directory does not exist at all: ' + SWATCH_UPLOADS_DIR);
    return available;
  }

  const entries = await fs.readdir(SWATCH_UPLOADS_DIR);

  for (const code of entries) {
    const codeDir = path.join(SWATCH_UPLOADS_DIR, code);
    const stat = await fs.stat(codeDir).catch(() => null);
    if (!stat || !stat.isDirectory()) continue;

    const wipFiles = await readImageFiles(path.join(codeDir, 'wip'));
    const finalFiles = await readImageFiles(path.join(codeDir, 'final'));
    const refFiles = await readImageFiles(path.join(codeDir, 'reference'));

    if (wipFiles.length > 0 || finalFiles.length > 0 || refFiles.length > 0) {
      available.add(code);
    }
  }

  if (available.size === 0) {
    console.warn('  ⚠️ Found the folder but no swatch subfolder has any actual image files.');
  } else {
    console.log('  ✅ Swatch codes with real images on disk: ' + Array.from(available).join(', '));
  }

  return available;
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function getSwatchCodeFromReference(swatchReferences: ReferenceItem[], swatches: Swatch[]): string | null {
  for (const ref of swatchReferences) {
    for (const swatch of swatches) {
      if (
        normalizeCode(ref.id) === normalizeCode(swatch.swatchCode) ||
        ref.id === String(swatch.id) ||
        (ref.label && ref.label.includes(swatch.swatchCode))
      ) {
        return swatch.swatchCode;
      }
    }
  }
  return null;
}

async function loadSwatchImages(swatchCode: string): Promise<{
  wipImages: ImageItem[];
  finalImages: ImageItem[];
  refImages: ImageItem[];
}> {
  const baseDir = path.join(SWATCH_UPLOADS_DIR, swatchCode);

  const result = {
    wipImages: [] as ImageItem[],
    finalImages: [] as ImageItem[],
    refImages: [] as ImageItem[],
  };

  console.log('  📂 Resolving images from: ' + baseDir);

  // Load WIP images
  const wipDir = path.join(baseDir, 'wip');
  try {
    if (await fs.pathExists(wipDir)) {
      const imageFiles = await readImageFiles(wipDir);
      console.log('  📁 Found ' + imageFiles.length + ' WIP images in ' + wipDir);

      for (const file of imageFiles) {
        const filePath = path.join(wipDir, file);
        const base64Data = await imageToBase64(filePath);
        const size = await getFileSize(filePath);
        const mimeType = getMimeType(filePath);

        result.wipImages.push({ data: base64Data, name: file, size: size, type: mimeType });
        console.log('  ✅ Loaded WIP image: ' + file + ' (' + size + ' bytes)');
      }
    } else {
      console.log('  ⚠️ WIP directory not found: ' + wipDir);
    }
  } catch (error) {
    console.warn('  ⚠️ Error loading WIP images:', error);
  }

  // Load Final images
  const finalDir = path.join(baseDir, 'final');
  try {
    if (await fs.pathExists(finalDir)) {
      const imageFiles = await readImageFiles(finalDir);
      console.log('  📁 Found ' + imageFiles.length + ' Final images in ' + finalDir);

      for (const file of imageFiles) {
        const filePath = path.join(finalDir, file);
        const base64Data = await imageToBase64(filePath);
        const size = await getFileSize(filePath);
        const mimeType = getMimeType(filePath);

        result.finalImages.push({ data: base64Data, name: file, size: size, type: mimeType });
        console.log('  ✅ Loaded Final image: ' + file + ' (' + size + ' bytes)');
      }
    } else {
      console.log('  ⚠️ Final directory not found: ' + finalDir);
    }
  } catch (error) {
    console.warn('  ⚠️ Error loading Final images:', error);
  }

  // Load Reference images
  const refDir = path.join(baseDir, 'reference');
  try {
    if (await fs.pathExists(refDir)) {
      const imageFiles = await readImageFiles(refDir);
      console.log('  📁 Found ' + imageFiles.length + ' Reference images in ' + refDir);

      for (const file of imageFiles) {
        const filePath = path.join(refDir, file);
        const base64Data = await imageToBase64(filePath);
        const size = await getFileSize(filePath);
        const mimeType = getMimeType(filePath);

        result.refImages.push({ data: base64Data, name: file, size: size, type: mimeType });
        console.log('  ✅ Loaded Reference image: ' + file + ' (' + size + ' bytes)');
      }
    } else {
      console.log('  ⚠️ Reference directory not found: ' + refDir);
    }
  } catch (error) {
    console.warn('  ⚠️ Error loading Reference images:', error);
  }

  // Only use placeholders if NO images were found at all
  const placeholderData = generatePlaceholderBase64();

  if (result.wipImages.length === 0) {
    console.log('  ⚠️ No WIP images found for ' + swatchCode + ', using placeholders');
    result.wipImages = [
      { data: placeholderData, name: 'WIP Placeholder 1', size: 0, type: 'image/png' },
      { data: placeholderData, name: 'WIP Placeholder 2', size: 0, type: 'image/png' },
    ];
  }

  if (result.finalImages.length === 0) {
    console.log('  ⚠️ No Final images found for ' + swatchCode + ', using placeholders');
    result.finalImages = [
      { data: placeholderData, name: 'Final Placeholder 1', size: 0, type: 'image/png' },
      { data: placeholderData, name: 'Final Placeholder 2', size: 0, type: 'image/png' },
    ];
  }

  if (result.refImages.length === 0) {
    console.log('  ⚠️ No Reference images found for ' + swatchCode + ', using placeholders');
    result.refImages = [
      { data: placeholderData, name: 'Reference Placeholder 1', size: 0, type: 'image/png' },
      { data: placeholderData, name: 'Reference Placeholder 2', size: 0, type: 'image/png' },
    ];
  }

  return result;
}

// ============================================
// Helper Functions
// ============================================

function getRandomPriority(): 'Low' | 'Medium' | 'High' | 'Urgent' {
  const priorities: ('Low' | 'Medium' | 'High' | 'Urgent')[] = [
    'Low', 'Medium', 'High', 'Urgent'
  ];
  return faker.helpers.arrayElement(priorities);
}

function getRandomStatus(): 'Draft' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' {
  const statuses: ('Draft' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled')[] = [
    'Draft', 'Pending', 'In Progress', 'Completed', 'Cancelled'
  ];
  return faker.helpers.arrayElement([
    ...statuses,
    'In Progress', 'In Progress', 'Completed', 'Completed'
  ]);
}

function getRandomUnitType(unitTypes: UnitType[]): string | null {
  if (unitTypes.length === 0) {
    return null;
  }
  if (faker.number.int({ min: 0, max: 10 }) < 2) {
    return null;
  }
  const unitType = faker.helpers.arrayElement(unitTypes);
  return unitType.name;
}

function getRandomDepartment(departments: Department[]): string | null {
  if (departments.length === 0) {
    return null;
  }
  if (faker.number.int({ min: 0, max: 10 }) < 2) {
    return null;
  }
  const department = faker.helpers.arrayElement(departments);
  return department.name;
}

function getRandomIssuedTo(): string | null {
  const recipients = [
    'Artist', 'Sampling Team', 'Production Team', 'Design Team', 'QC Team',
    'Senior Designer', 'Production Manager', null
  ];
  return faker.helpers.arrayElement(recipients);
}

const REFERENCE_REMARKS = [
  'Refer to sleeve pattern only.',
  'Use for lining, not the outer shell.',
  'Client approved this exact shade previously.',
  'Match the neckline detailing from this style.',
  'Similar silhouette requested by client.',
  'For color reference only, not fabric weight.',
  'Trim/border to be reused from this reference.',
  'Client liked the drape on this one specifically.',
];

interface SwatchAttributes {
  color: string;
  fabricType: string;
  technique?: string;
  context?: string;
}

function generateSwatchAttributes(): SwatchAttributes {
  const color = faker.helpers.arrayElement(FABRIC_COLORS);
  const fabricType = faker.helpers.arrayElement(FABRIC_TYPES);
  const technique = faker.datatype.boolean({ probability: 0.5 })
    ? faker.helpers.arrayElement(FABRIC_TECHNIQUES)
    : undefined;
  const context = faker.datatype.boolean({ probability: 0.5 })
    ? faker.helpers.arrayElement(GARMENT_CONTEXTS)
    : undefined;
  return { color, fabricType, technique, context };
}

function relevanceScore(text: string, attrs: SwatchAttributes): number {
  const lower = (text || '').toLowerCase();
  let score = 0;

  if (lower.includes(attrs.color.toLowerCase())) score += 3;

  for (const word of attrs.fabricType.toLowerCase().split(/\s+/)) {
    if (word.length > 3 && lower.includes(word)) score += 2;
  }

  if (attrs.technique) {
    for (const word of attrs.technique.toLowerCase().split(/\s+/)) {
      if (word.length > 3 && lower.includes(word)) score += 2;
    }
  }

  if (attrs.context) {
    for (const word of attrs.context.toLowerCase().split(/\s+/)) {
      if (word.length > 3 && lower.includes(word)) score += 1;
    }
  }

  return score;
}

function pickRelated<T>(
  items: T[],
  getText: (item: T) => string,
  attrs: SwatchAttributes,
  minCount: number,
  maxCount: number
): T[] {
  if (items.length === 0 || maxCount === 0) return [];

  const scored = items.map((item) => ({ item, score: relevanceScore(getText(item), attrs) }));
  const related = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  const count = faker.number.int({ min: minCount, max: Math.min(maxCount, items.length) });
  if (count === 0) return [];

  if (related.length >= count) {
    const pool = related.slice(0, Math.max(count, Math.min(related.length, count + 2))).map((r) => r.item);
    return faker.helpers.arrayElements(pool, Math.min(count, pool.length));
  }

  const relatedItems = related.map((r) => r.item);
  const remaining = count - relatedItems.length;
  if (remaining > 0) {
    const unrelatedPool = items.filter((i) => !relatedItems.includes(i));
    const fillers = faker.helpers.arrayElements(unrelatedPool, Math.min(remaining, unrelatedPool.length));
    return [...relatedItems, ...fillers];
  }
  return relatedItems;
}

function generateStyleReferences(styles: Style[], attrs: SwatchAttributes): ReferenceItem[] {
  if (styles.length === 0) {
    return [];
  }
  const selected = pickRelated(
    styles,
    (style) => (style.styleNo || '') + ' ' + style.name,
    attrs,
    0,
    Math.min(3, styles.length)
  );
  return selected.map(function(style) {
    return {
      id: 'sto:' + style.id,
      label: (style.styleNo || style.name) + ' – ' + style.name,
      remark: faker.helpers.maybe(function() { return faker.helpers.arrayElement(REFERENCE_REMARKS); }, { probability: 0.3 }) || ''
    };
  });
}

function generateSwatchReferences(swatches: Swatch[], attrs: SwatchAttributes): ReferenceItem[] {
  if (swatches.length === 0) {
    return [];
  }
  const selected = pickRelated(
    swatches,
    (swatch) => swatch.swatchName,
    attrs,
    1,
    Math.min(2, swatches.length)
  );
  return selected.map(function(swatch) {
    return {
      id: swatch.swatchCode || String(swatch.id),
      label: (swatch.swatchCode || swatch.swatchName) + ' – ' + swatch.swatchName,
      remark: faker.helpers.maybe(function() { return faker.helpers.arrayElement(REFERENCE_REMARKS); }, { probability: 0.2 }) || ''
    };
  });
}

function generateEstimate(): EstimateItem[] {
  const estimateItems: EstimateItem[] = [
    { id: 'sampling', label: 'Sampling', rate: '', isCustom: false },
    { id: 'artwork', label: 'Artwork', rate: '', isCustom: false },
    { id: 'material', label: 'Material', rate: '', isCustom: false },
    { id: 'embroidery', label: 'Embroidery', rate: '', isCustom: false },
    { id: 'fabric', label: 'Fabric', rate: '', isCustom: false },
    { id: 'qc', label: 'QC', rate: '', isCustom: false },
    { id: 'travel', label: 'Travel', rate: '', isCustom: false },
    { id: 'overheads', label: 'Overheads', rate: '', isCustom: false },
  ];

  return estimateItems.map(function(item) {
    return {
      ...item,
      rate: faker.helpers.maybe(function() { return faker.number.int({ min: 100, max: 5000 }).toString(); }, { probability: 0.5 }) || ''
    };
  });
}

/**
 * Generate tags based on swatch attributes - makes tags relevant to the swatch
 */
function generateRelevantTags(attrs: SwatchAttributes): string[] {
  const tags: string[] = [];
  
  // Add color tag
  if (attrs.color) {
    tags.push(attrs.color.toLowerCase());
  }
  
  // Add fabric type tag
  if (attrs.fabricType) {
    // Extract primary fabric name (first word or two)
    const fabricWords = attrs.fabricType.split(' ');
    if (fabricWords.length > 0) {
      tags.push(fabricWords[0].toLowerCase());
      if (fabricWords.length > 1) {
        tags.push(fabricWords.slice(0, 2).join('-').toLowerCase());
      }
    }
  }
  
  // Add technique tag
  if (attrs.technique) {
    const techWords = attrs.technique.split(' ');
    if (techWords.length > 0) {
      tags.push(techWords[0].toLowerCase());
      if (techWords.length > 1) {
        tags.push(techWords.slice(0, 2).join('-').toLowerCase());
      }
    }
  }
  
  // Add context tag
  if (attrs.context) {
    const contextWords = attrs.context.split(' ');
    if (contextWords.length > 0) {
      tags.push(contextWords[0].toLowerCase());
      if (contextWords.length > 1) {
        tags.push(contextWords.slice(0, 2).join('-').toLowerCase());
      }
    }
  }
  
  // Add quality/descriptor tags
  const descriptors = ['premium', 'luxury', 'designer', 'handcrafted', 'artisanal'];
  if (faker.datatype.boolean({ probability: 0.3 })) {
    tags.push(faker.helpers.arrayElement(descriptors));
  }
  
  // Add category tags
  const categories = ['fabric', 'swatch', 'sample', 'material'];
  if (faker.datatype.boolean({ probability: 0.2 })) {
    tags.push(faker.helpers.arrayElement(categories));
  }
  
  // Remove duplicates and limit to 2-5 tags
  const uniqueTags = [...new Set(tags)];
  const tagCount = faker.number.int({ min: 2, max: Math.min(5, uniqueTags.length) });
  
  // If we don't have enough tags, add some generic ones
  while (uniqueTags.length < tagCount) {
    const genericTags = ['textile', 'fashion', 'apparel', 'garment', 'design', 'pattern'];
    const generic = faker.helpers.arrayElement(genericTags);
    if (!uniqueTags.includes(generic)) {
      uniqueTags.push(generic);
    }
  }
  
  return faker.helpers.arrayElements(uniqueTags, tagCount);
}

// ============================================
// Fashion/textile domain vocabulary
// ============================================

const FABRIC_COLORS = [
  'Ivory', 'Champagne', 'Blush Pink', 'Emerald Green', 'Sapphire Blue',
  'Charcoal Grey', 'Midnight Black', 'Burgundy', 'Terracotta', 'Mustard Yellow',
  'Rose Gold', 'Royal Blue', 'Forest Green', 'Dusty Rose', 'Mint Green',
  'Coral', 'Lavender', 'Wine Red', 'Peach', 'Beige', 'Off-White',
  'Powder Blue', 'Maroon', 'Olive Green', 'Rust', 'Fuchsia', 'Turquoise',
  'Navy Blue', 'Copper', 'Pearl White', 'Magenta', 'Steel Grey', 'Indigo',
  'Golden Yellow', 'Cream', 'Plum', 'Teal', 'Bronze', 'Silver', 'Onyx Black',
];

const FABRIC_TYPES = [
  'Silk Charmeuse', 'Georgette', 'Chiffon', 'Cotton Poplin', 'Linen',
  'Denim', 'Velvet', 'Organza', 'Net', 'Tulle', 'Crepe', 'Satin',
  'Jacquard', 'Brocade', 'Dupion Silk', 'Khadi', 'Muslin', 'Voile',
  'Twill', 'Corduroy', 'Chambray', 'Modal', 'Rayon', 'Chanderi Silk',
  'Banarasi Silk', 'Tussar Silk', 'Crepe De Chine', 'Tencel', 'Habutai Silk',
  'Cotton Cambric', 'Viscose', 'Terry Cloth', 'Fleece', 'Lycra Blend',
];

const FABRIC_TECHNIQUES = [
  'Hand Embroidered', 'Zari Work', 'Mirror Work', 'Sequined', 'Block Print',
  'Batik Print', 'Ikat Print', 'Floral Print', 'Geometric Print', 'Digital Print',
  'Thread Work', 'Beaded', 'Appliqué', 'Lace Trim', 'Hand-Painted',
  'Tie-Dye', 'Ombre', 'Pleated', 'Ruffled', 'Quilted', 'Chikankari',
  'Gota Patti', 'Resham Work', 'Kantha Stitch',
];

const GARMENT_CONTEXTS = [
  'Bridal Lehenga', 'Party Wear Gown', 'Festive Kurta', 'Saree Blouse',
  'Evening Gown', 'Anarkali Suit', 'Designer Blouse', 'Wedding Sherwani',
  'Cocktail Dress', 'Formal Blazer', 'Summer Dress', 'Winter Coat',
  'Casual Shirt', 'Palazzo Set', 'Indo-Western Outfit', 'Ethnic Jacket',
];

const DRAPE_ADJECTIVES = [
  'luxurious', 'lightweight', 'breathable', 'rich', 'soft',
  'structured', 'flowing', 'crisp', 'sumptuous', 'delicate', 'supple',
];

const QUALITY_FEATURES = [
  'a smooth finish', 'a subtle sheen', 'a rich woven texture', 'an elegant drape',
  'a matte finish', 'a glossy surface', 'a soft hand-feel', 'a durable weave',
  'natural stretch', 'a crisp structured feel',
];

const INTERNAL_NOTES = [
  'Client wants exact shade match to the reference swatch.',
  'Requires an additional round of embroidery sampling before approval.',
  'Match to previous season\'s fabric batch for consistency.',
  'Client prefers a matte finish over glossy for this piece.',
  'Urgent — needed ahead of the client photoshoot.',
  'Vendor confirmed a 2-week lead time for this fabric.',
  'Double-check colorfastness before bulk order.',
  'Client flagged shrinkage concerns from the last batch.',
  'Awaiting final artwork approval from design team.',
  'Sample to be couriered to client for physical review.',
];

const CLIENT_INSTRUCTIONS = [
  'Please match the color exactly to the attached reference image.',
  'Keep the embroidery density lighter than the sample shown.',
  'Fabric should have a soft drape suitable for a flowing silhouette.',
  'Avoid any sheen — client wants a strictly matte finish.',
  'Use the same trim as the previous order for this client.',
  'Client requested a slightly heavier weight fabric this time.',
  'Please send swatch photos before proceeding to bulk production.',
  'Client is flexible on shade but firm on the fabric texture.',
];

function buildSwatchName(attrs: SwatchAttributes): string {
  if (attrs.technique) {
    return attrs.color + ' ' + attrs.technique + ' ' + attrs.fabricType;
  }
  if (attrs.context) {
    return attrs.color + ' ' + attrs.fabricType + ' – ' + attrs.context;
  }
  return attrs.color + ' ' + attrs.fabricType;
}

function buildSwatchDescription(attrs: SwatchAttributes): string {
  const drape = faker.helpers.arrayElement(DRAPE_ADJECTIVES);
  const feature = faker.helpers.arrayElement(QUALITY_FEATURES);
  const context = attrs.context || faker.helpers.arrayElement(GARMENT_CONTEXTS);
  return 'A ' + drape + ' ' + attrs.fabricType.toLowerCase() + ' with ' + feature +
    ', well suited for a ' + context.toLowerCase() + '.';
}

function generateInternalNote(): string {
  return faker.helpers.arrayElement(INTERNAL_NOTES);
}

function generateClientInstruction(): string {
  return faker.helpers.arrayElement(CLIENT_INSTRUCTIONS);
}

// ------------------------------
// NEW DATE GENERATION (FIXED RANGE)
// ------------------------------
function generateDateInRange(monthsPast: number = 3, monthsFuture: number = 3): string {
  const now = new Date();
  const start = new Date(now);
  start.setMonth(start.getMonth() - monthsPast);
  const end = new Date(now);
  end.setMonth(end.getMonth() + monthsFuture);
  return faker.date.between({ from: start, to: end }).toISOString().slice(0, 10);
}
// ---------------------------------

function getFabric(fabrics: Fabric[]): { fabricId: string | null; fabricName: string | null } {
  if (fabrics.length === 0) {
    return { fabricId: null, fabricName: null };
  }
  if (faker.number.int({ min: 0, max: 10 }) < 3) {
    return { fabricId: null, fabricName: null };
  }
  const fabric = faker.helpers.arrayElement(fabrics);
  const fabricName = fabric.fabricCode + ' - ' + fabric.quality + ' (' + fabric.colorName + ')';
  return {
    fabricId: String(fabric.id),
    fabricName: fabricName
  };
}

function getLiningFabric(fabrics: Fabric[], hasLining: boolean): { liningFabricId: string | null; liningFabricName: string | null } {
  if (!hasLining) {
    return { liningFabricId: null, liningFabricName: null };
  }
  
  if (fabrics.length === 0) {
    return { liningFabricId: null, liningFabricName: null };
  }
  
  const fabric = faker.helpers.arrayElement(fabrics);
  const fabricName = fabric.fabricCode + ' - ' + fabric.quality + ' (' + fabric.colorName + ') – Premium';
  return {
    liningFabricId: String(fabric.id),
    liningFabricName: fabricName
  };
}

function getClient(clients: Client[]): { clientId: string | null; clientName: string | null } {
  if (clients.length === 0) {
    return { clientId: null, clientName: null };
  }
  if (faker.number.int({ min: 0, max: 10 }) < 1) {
    return { clientId: null, clientName: null };
  }
  const client = faker.helpers.arrayElement(clients);
  return {
    clientId: String(client.id),
    clientName: client.brandName
  };
}

function generateSwatchOrderData(
  fabrics: Fabric[],
  styles: Style[],
  swatches: Swatch[],
  clients: Client[],
  unitTypes: UnitType[],
  departments: Department[]
): SwatchOrderSeedData {
  // === DATE RANGE FIX ===
  const orderIssueDate = generateDateInRange();
  // deliveryDate between orderIssueDate and 3 months later
  const maxDelivery = new Date(orderIssueDate);
  maxDelivery.setMonth(maxDelivery.getMonth() + 3);
  const deliveryDate = faker.date.between({
    from: new Date(orderIssueDate),
    to: maxDelivery
  }).toISOString().slice(0, 10);
  // =======================

  const hasLining = faker.datatype.boolean({ probability: 0.4 });
  const fabric = getFabric(fabrics);
  const liningFabric = getLiningFabric(fabrics, hasLining);
  const client = getClient(clients);
  const status = getRandomStatus();
  const isChargeable = faker.datatype.boolean({ probability: 0.7 });
  const isInhouse = faker.datatype.boolean({ probability: 0.3 });

  let approvalDate = null;
  let actualStartDate = null;
  let actualStartTime = null;
  let actualCompletionDate = null;
  let actualCompletionTime = null;
  let tentativeDeliveryDate = null;
  let delayReason = null;
  let cancelReason = null;

  if (status === 'Completed') {
    const baseDate = new Date(orderIssueDate);
    
    approvalDate = faker.date.between({ 
      from: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000),
      to: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    }).toISOString().slice(0, 10);
    
    const startBase = new Date(approvalDate);
    actualStartDate = faker.date.between({
      from: new Date(startBase.getTime() + 1 * 24 * 60 * 60 * 1000),
      to: new Date(startBase.getTime() + 3 * 24 * 60 * 60 * 1000)
    }).toISOString().slice(0, 10);
    actualStartTime = faker.helpers.maybe(function() { 
      return faker.date.recent().toTimeString().slice(0, 5); 
    }, { probability: 0.7 }) || '';
    
    const completionBase = new Date(actualStartDate);
    actualCompletionDate = faker.date.between({
      from: new Date(completionBase.getTime() + 5 * 24 * 60 * 60 * 1000),
      to: new Date(completionBase.getTime() + 15 * 24 * 60 * 60 * 1000)
    }).toISOString().slice(0, 10);
    actualCompletionTime = faker.helpers.maybe(function() { 
      return faker.date.recent().toTimeString().slice(0, 5); 
    }, { probability: 0.7 }) || '';
    
    const deliveryBase = new Date(actualCompletionDate);
    tentativeDeliveryDate = faker.date.between({
      from: new Date(deliveryBase.getTime() + 2 * 24 * 60 * 60 * 1000),
      to: new Date(deliveryBase.getTime() + 5 * 24 * 60 * 60 * 1000)
    }).toISOString().slice(0, 10);
    
    delayReason = faker.helpers.maybe(function() {
      return faker.helpers.arrayElement([
        'Fabric delivery delayed by 2 days',
        'Artwork revision required additional time',
        'Machine breakdown caused 1 day delay',
        'Staff shortage extended timeline'
      ]);
    }, { probability: 0.3 }) || null;
    
  } else if (status === 'In Progress') {
    const baseDate = new Date(orderIssueDate);
    
    approvalDate = faker.date.between({
      from: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000),
      to: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000)
    }).toISOString().slice(0, 10);
    
    actualStartDate = faker.date.between({
      from: new Date(new Date(approvalDate).getTime() + 1 * 24 * 60 * 60 * 1000),
      to: new Date(new Date(approvalDate).getTime() + 3 * 24 * 60 * 60 * 1000)
    }).toISOString().slice(0, 10);
    actualStartTime = faker.helpers.maybe(function() { 
      return faker.date.recent().toTimeString().slice(0, 5); 
    }, { probability: 0.7 }) || '';
    
    tentativeDeliveryDate = faker.date.between({
      from: new Date(),
      to: new Date(new Date().setMonth(new Date().getMonth() + 2))
    }).toISOString().slice(0, 10);
    
    delayReason = faker.helpers.maybe(function() {
      return faker.helpers.arrayElement([
        'Fabric delivery delayed',
        'Artwork revision required',
        'Machine breakdown',
        'Staff shortage'
      ]);
    }, { probability: 0.3 }) || null;
    
  } else if (status === 'Pending') {
    const baseDate = new Date(orderIssueDate);
    approvalDate = faker.helpers.maybe(function() {
      return faker.date.between({
        from: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000),
        to: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000)
      }).toISOString().slice(0, 10);
    }, { probability: 0.5 }) || null;
    
  } else if (status === 'Cancelled') {
    cancelReason = faker.helpers.arrayElement([
      'Client requested cancellation',
      'Budget constraints',
      'Design not approved',
      'Production issues'
    ]);
  }

  const attrs = generateSwatchAttributes();
  
  // Generate relevant tags based on swatch attributes
  const tags = generateRelevantTags(attrs);

  return {
    swatchName: buildSwatchName(attrs),
    clientId: client.clientId,
    clientName: client.clientName,
    isChargeable: isChargeable,
    isInhouse: isInhouse,
    quantity: faker.helpers.maybe(function() { return faker.number.int({ min: 1, max: 20 }).toString(); }, { probability: 0.8 }) || null,
    priority: getRandomPriority(),
    orderStatus: status,
    styleReferences: generateStyleReferences(styles, attrs),
    swatchReferences: generateSwatchReferences(swatches, attrs),
    fabricId: fabric.fabricId,
    fabricName: fabric.fabricName,
    hasLining: hasLining,
    liningFabricId: liningFabric.liningFabricId,
    liningFabricName: liningFabric.liningFabricName,
    unitLength: faker.helpers.maybe(function() { return faker.number.int({ min: 1, max: 50 }).toString(); }, { probability: 0.7 }) || null,
    unitWidth: faker.helpers.maybe(function() { return faker.number.int({ min: 1, max: 50 }).toString(); }, { probability: 0.7 }) || null,
    unitType: getRandomUnitType(unitTypes),
    orderIssueDate: orderIssueDate,
    deliveryDate: deliveryDate,
    targetHours: faker.helpers.maybe(function() { return faker.number.int({ min: 4, max: 72 }).toString(); }, { probability: 0.6 }) || null,
    issuedTo: getRandomIssuedTo(),
    department: getRandomDepartment(departments),
    description: faker.helpers.maybe(function() { return buildSwatchDescription(attrs); }, { probability: 0.4 }) || null,
    internalNotes: faker.helpers.maybe(generateInternalNote, { probability: 0.3 }) || null,
    clientInstructions: faker.helpers.maybe(generateClientInstruction, { probability: 0.3 }) || null,
    refDocs: [],
    refImages: [],
    wipImages: [],
    finalImages: [],
    wipVideos: [],
    finalVideos: [],
    estimate: generateEstimate(),
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
    tags: tags
  };
}

async function generateOrderCode(clientId: string | null): Promise<string> {
  const prefix = clientId ? clientId + '-ZSWA' : 'CL-ZSWA';

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(swatchOrdersTable)
    .where(
      clientId ? eq(swatchOrdersTable.clientId, clientId) : sql`1=1`
    );

  const count = result[0]?.count || 0;
  const sequence = String(count + 1).padStart(4, '0');
  return prefix + '-' + sequence;
}

async function insertSwatchOrder(
  data: SwatchOrderSeedData,
  allSwatches: Swatch[],
  availableImageCodes: Set<string>
): Promise<void> {
  try {
    const orderCode = await generateOrderCode(data.clientId);

    let wipImages: ImageItem[] = [];
    let finalImages: ImageItem[] = [];
    let refImages: ImageItem[] = [];

    let swatchCode: string | null = getSwatchCodeFromReference(data.swatchReferences, allSwatches);

    if (swatchCode && !availableImageCodes.has(swatchCode)) {
      console.log('  ℹ️ Referenced swatch ' + swatchCode + ' has no downloaded images.');
      swatchCode = null;
    }

    if (!swatchCode && availableImageCodes.size > 0) {
      swatchCode = faker.helpers.arrayElement(Array.from(availableImageCodes));
      console.log('  ↳ Substituting swatch with real images instead: ' + swatchCode);
    }

    if (swatchCode) {
      console.log('  📸 Loading images for swatch: ' + swatchCode);
      const images = await loadSwatchImages(swatchCode);
      wipImages = images.wipImages;
      finalImages = images.finalImages;
      refImages = images.refImages;

      if (wipImages.length > 0 && wipImages[0].data.indexOf('placeholder') === -1) {
        console.log('  ✅ Loaded ' + wipImages.length + ' WIP, ' + finalImages.length + ' Final, ' + refImages.length + ' Reference images for ' + swatchCode);
      }
    } else {
      console.log('  ⚠️ No swatch with downloaded images available at all — using placeholders.');
      const placeholderData = generatePlaceholderBase64();
      wipImages = [
        { data: placeholderData, name: 'WIP Placeholder 1', size: 0, type: 'image/png' },
        { data: placeholderData, name: 'WIP Placeholder 2', size: 0, type: 'image/png' },
      ];
      finalImages = [
        { data: placeholderData, name: 'Final Placeholder 1', size: 0, type: 'image/png' },
        { data: placeholderData, name: 'Final Placeholder 2', size: 0, type: 'image/png' },
      ];
      refImages = [
        { data: placeholderData, name: 'Reference Placeholder 1', size: 0, type: 'image/png' },
        { data: placeholderData, name: 'Reference Placeholder 2', size: 0, type: 'image/png' },
      ];
    }

    await db.transaction(async (tx) => {
      const [order] = await tx.insert(swatchOrdersTable).values({
        orderCode: orderCode,
        swatchName: data.swatchName,
        clientId: data.clientId,
        clientName: data.clientName,
        isChargeable: data.isChargeable,
        isInhouse: data.isInhouse,
        quantity: data.quantity,
        priority: data.priority,
        orderStatus: data.orderStatus,
        styleReferences: data.styleReferences,
        swatchReferences: data.swatchReferences,
        fabricId: data.fabricId,
        fabricName: data.fabricName,
        hasLining: data.hasLining,
        liningFabricId: data.liningFabricId,
        liningFabricName: data.liningFabricName,
        unitLength: data.unitLength,
        unitWidth: data.unitWidth,
        unitType: data.unitType,
        orderIssueDate: data.orderIssueDate,
        deliveryDate: data.deliveryDate,
        targetHours: data.targetHours,
        issuedTo: data.issuedTo,
        department: data.department,
        description: data.description,
        internalNotes: data.internalNotes,
        clientInstructions: data.clientInstructions,
        refDocs: data.refDocs,
        refImages: refImages,
        wipImages: wipImages,
        finalImages: finalImages,
        wipVideos: data.wipVideos,
        finalVideos: data.finalVideos,
        estimate: data.estimate,
        actualStartDate: data.actualStartDate,
        actualStartTime: data.actualStartTime,
        tentativeDeliveryDate: data.tentativeDeliveryDate,
        actualCompletionDate: data.actualCompletionDate,
        actualCompletionTime: data.actualCompletionTime,
        delayReason: data.delayReason,
        cancelReason: data.cancelReason,
        approvalDate: data.approvalDate,
        revisionCount: data.revisionCount,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
        createdAt: new Date(),
      }).returning();

      if (data.tags && data.tags.length > 0 && order) {
        const tagValues = data.tags.map(function(tag) {
          return {
            entityType: 'swatch_order',
            entityId: order.id,
            tag: tag,
          };
        });
        await tx.insert(entityTagsTable)
          .values(tagValues)
          .onConflictDoNothing();
      }

      console.log('✅ Created swatch order: ' + data.swatchName + ' (Code: ' + orderCode + ', ID: ' + order?.id + ')');
    });
  } catch (error) {
    console.error('❌ Failed to create swatch order: ' + data.swatchName, error);
    throw error;
  }
}

// ============================================
// Main Seed Function
// ============================================

export async function seedSwatchOrders(count: number = 50): Promise<void> {
  console.log('\n🌱 Starting SwatchOrderSeeder with ' + count + ' orders...\n');

  console.log('📊 Fetching related data from database...');

  const fabrics = await db
    .select({
      id: fabricsTable.id,
      fabricCode: fabricsTable.fabricCode,
      fabricType: fabricsTable.fabricType,
      quality: fabricsTable.quality,
      colorName: fabricsTable.colorName,
    })
    .from(fabricsTable)
    .where(
      and(
        eq(fabricsTable.isActive, true),
        eq(fabricsTable.isDeleted, false)
      )
    );
  console.log('   ✅ Found ' + fabrics.length + ' fabrics');

  const styles = await db
    .select({
      id: styleOrdersTable.id,
      name: styleOrdersTable.styleName,
      styleNo: styleOrdersTable.styleNo,
    })
    .from(styleOrdersTable)
    .where(eq(styleOrdersTable.isDeleted, false));
  console.log('   ✅ Found ' + styles.length + ' style orders');

  const swatches = await db
    .select({
      id: swatchesTable.id,
      swatchCode: swatchesTable.swatchCode,
      swatchName: swatchesTable.swatchName,
    })
    .from(swatchesTable)
    .where(
      and(
        eq(swatchesTable.isActive, true),
        eq(swatchesTable.isDeleted, false)
      )
    );
  console.log('   ✅ Found ' + swatches.length + ' swatches');

  const clients = await db
    .select({
      id: clientsTable.id,
      brandName: clientsTable.brandName,
      clientCode: clientsTable.clientCode,
    })
    .from(clientsTable)
    .where(
      and(
        eq(clientsTable.isActive, true),
        eq(clientsTable.isDeleted, false)
      )
    );
  console.log('   ✅ Found ' + clients.length + ' clients');

  const unitTypes = await db
    .select({
      id: unitTypesTable.id,
      name: unitTypesTable.name,
    })
    .from(unitTypesTable)
    .where(
      and(
        eq(unitTypesTable.isActive, true),
        eq(unitTypesTable.isDeleted, false)
      )
    );
  console.log('   ✅ Found ' + unitTypes.length + ' unit types');

  const departments = await db
    .select({
      id: departmentsTable.id,
      name: departmentsTable.name,
    })
    .from(departmentsTable)
    .where(
      and(
        eq(departmentsTable.isActive, true),
        eq(departmentsTable.isDeleted, false)
      )
    );
  console.log('   ✅ Found ' + departments.length + ' departments from database');

  if (clients.length === 0) {
    console.warn('⚠️ No clients found. Orders will be created without client association.');
  }
  if (fabrics.length === 0) {
    console.warn('⚠️ No fabrics found. Orders will be created without fabric association.');
  }
  if (departments.length === 0) {
    console.warn('⚠️ No departments found. Orders will be created without department association.');
  }
  if (swatches.length === 0) {
    console.warn('⚠️ No swatches found. Orders will be created without swatch references.');
  }

  const availableImageCodes = await scanAvailableSwatchImageCodes();

  if (availableImageCodes.size === 0) {
    console.warn('\n⚠️⚠️⚠️ No swatch folders with real images were found. Every order will use placeholders.');
    console.warn('   Checked: ' + SWATCH_UPLOADS_DIR);
    console.warn('   Fix: run the image-download script first, or set SWATCH_UPLOADS_DIR to point at its output.\n');
  } else {
    const dbCodesSet = new Set(swatches.map((s) => normalizeCode(s.swatchCode)));
    const overlap = Array.from(availableImageCodes).filter((c) => dbCodesSet.has(normalizeCode(c)));
    console.log(
      '\nℹ️ ' + overlap.length + '/' + availableImageCodes.size +
      ' downloaded-image folders match a real swatch code in your DB. ' +
      'The rest will still be used as fallback images (real photos, just not tied to the "correct" swatch).\n'
    );
  }

  let created = 0;
  for (let i = 0; i < count; i++) {
    const data = generateSwatchOrderData(
      fabrics,
      styles,
      swatches,
      clients,
      unitTypes,
      departments
    );
    try {
      await insertSwatchOrder(data, swatches, availableImageCodes);
      created++;
    } catch (error) {
      console.error('❌ Failed to create order ' + (i + 1) + ':', error);
    }

    if ((i + 1) % 10 === 0) {
      console.log('📦 Progress: ' + (i + 1) + '/' + count + ' orders processed');
    }
  }

  console.log('\n✅ SwatchOrderSeeder completed! Created ' + created + '/' + count + ' orders.');
}

// ============================================
// Self-execution for ESM
// ============================================

var isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  var count = parseInt(process.argv[2]) || 50;
  seedSwatchOrders(count).catch(console.error);
}