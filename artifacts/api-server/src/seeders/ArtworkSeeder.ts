import { db, artworksTable, swatchOrdersTable, eq, sql, and } from "@workspace/db";
import { faker } from "@faker-js/faker";
import fs from "fs-extra";
import path from "path";

// ============================================
// Types
// ============================================

interface ImageItem {
  data: string;
  name: string;
  size: number;
  type: string;
}

interface ArtworkSeedData {
  swatchOrderId: number;
  artworkName: string;
  unitLength?: string;
  unitWidth?: string;
  unitType?: string;
  artworkCreated?: string;
  workHours?: string;
  hourlyRate?: string;
  totalCost?: string;
  outsourceVendorId?: string;
  outsourceVendorName?: string;
  outsourcePaymentDate?: string;
  outsourcePaymentAmount?: string;
  outsourcePaymentMode?: string;
  outsourceTransactionId?: string;
  outsourcePaymentStatus?: string;
  feedbackStatus?: string;
  files?: object[];
  refImages?: ImageItem[];
  wipImages?: ImageItem[];
  finalImages?: ImageItem[];
  createdBy: string;
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

  if (!(await fs.pathExists(SWATCH_UPLOADS_DIR))) {
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

  return available;
}

/**
 * Loads images from the uploads folder for a given swatch order
 */
async function loadArtworkImages(orderCode: string): Promise<{
  refImages: ImageItem[];
  wipImages: ImageItem[];
  finalImages: ImageItem[];
}> {
  const baseDir = path.join(SWATCH_UPLOADS_DIR, orderCode);

  const result = {
    refImages: [] as ImageItem[],
    wipImages: [] as ImageItem[],
    finalImages: [] as ImageItem[],
  };

  // Load Reference images
  const refDir = path.join(baseDir, 'reference');
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
  const wipDir = path.join(baseDir, 'wip');
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
  const finalDir = path.join(baseDir, 'final');
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
      { data: placeholderData, name: 'Reference Placeholder 1', size: 0, type: 'image/png' },
      { data: placeholderData, name: 'Reference Placeholder 2', size: 0, type: 'image/png' },
    ];
  }

  if (result.wipImages.length === 0) {
    result.wipImages = [
      { data: placeholderData, name: 'WIP Placeholder 1', size: 0, type: 'image/png' },
      { data: placeholderData, name: 'WIP Placeholder 2', size: 0, type: 'image/png' },
    ];
  }

  if (result.finalImages.length === 0) {
    result.finalImages = [
      { data: placeholderData, name: 'Final Placeholder 1', size: 0, type: 'image/png' },
      { data: placeholderData, name: 'Final Placeholder 2', size: 0, type: 'image/png' },
    ];
  }

  return result;
}

// ============================================
// Helper Functions
// ============================================

function getRandomUnitType(): string {
  const unitTypes = ['Inch', 'Centimeter', 'Millimeter', 'Meter', 'Feet'];
  return faker.helpers.arrayElement(unitTypes);
}

function getRandomArtworkCreated(): string {
  return faker.helpers.arrayElement(['Inhouse', 'Outsourced']);
}

function getRandomPaymentStatus(): string {
  return faker.helpers.arrayElement(['Pending', 'Paid', 'Partially Paid']);
}

function getRandomFeedbackStatus(): string {
  return faker.helpers.arrayElement(['Pending', 'In Progress', 'Approved', 'Rejected', 'Changes Requested']);
}

function getRandomPaymentMode(): string {
  return faker.helpers.arrayElement(['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card']);
}

/**
 * Generate artwork name based on the swatch order's swatch name
 * This ensures the artwork is related to the swatch, not random ERP words
 */
function generateArtworkNameFromSwatch(swatchName: string): string {
  // Extract key elements from swatch name
  // e.g., "Ivory Hand Embroidered Silk Charmeuse" -> extract color, technique, fabric
  const words = swatchName.split(' ');
  
  // Common fabric types to look for
  const fabricTypes = ['Silk', 'Cotton', 'Linen', 'Velvet', 'Satin', 'Chiffon', 'Georgette', 
    'Organza', 'Tulle', 'Crepe', 'Jacquard', 'Brocade', 'Denim', 'Chambray', 'Modal', 
    'Rayon', 'Tencel', 'Viscose', 'Fleece', 'Terry', 'Lycra', 'Poplin', 'Muslin', 'Voile',
    'Twill', 'Corduroy', 'Khadi', 'Chanderi', 'Banarasi', 'Tussar', 'Habutai', 'Cambric'];
  
  // Common techniques to look for
  const techniques = ['Embroidered', 'Hand-Embroidered', 'Printed', 'Digital Printed', 
    'Block Printed', 'Batik', 'Ikat', 'Hand-Painted', 'Screen Printed', 'Woven', 
    'Knitted', 'Crocheted', 'Beaded', 'Sequined', 'Appliqued', 'Zari', 'Thread', 
    'Mirror', 'Sequin', 'Gota', 'Resham', 'Kantha', 'Chikankari', 'Ombre', 'Pleated', 
    'Ruffled', 'Quilted', 'Tie-Dye', 'Colorblock'];
  
  // Extract fabric type
  let fabricType = '';
  for (const word of words) {
    for (const type of fabricTypes) {
      if (word.toLowerCase().includes(type.toLowerCase())) {
        fabricType = type;
        break;
      }
    }
    if (fabricType) break;
  }
  
  // Extract technique
  let technique = '';
  for (const word of words) {
    for (const tech of techniques) {
      if (word.toLowerCase().includes(tech.toLowerCase())) {
        technique = tech;
        break;
      }
    }
    if (technique) break;
  }
  
  // Extract color (first word is usually the color)
  const color = words[0] || 'Design';
  
  // Build artwork name variations
  const templates = [
    // Option 1: Color + Technique + Fabric Type + Design
    () => `${color} ${technique || 'Design'} ${fabricType || ''} Artwork`.trim(),
    
    // Option 2: Technique + Swatch Name
    () => `${technique || 'Design'} – ${swatchName}`.trim(),
    
    // Option 3: Color + Swatch Name
    () => `${color} – ${swatchName}`.trim(),
    
    // Option 4: Fabric Type + Design + Color
    () => `${fabricType || ''} Design – ${color}`.trim(),
    
    // Option 5: Swatch Name + Artwork
    () => `${swatchName} Artwork`.trim(),
    
    // Option 6: Color + Technique + Design
    () => `${color} ${technique || 'Design'} Pattern`.trim(),
  ];
  
  // Pick random template
  let name = faker.helpers.arrayElement(templates)();
  
  // Clean up: remove double spaces, trim
  name = name.replace(/\s+/g, ' ').trim();
  
  // If somehow we got an empty string, fallback
  if (!name || name.length < 3) {
    name = `${swatchName} Artwork`;
  }
  
  return name;
}

/**
 * Generate artwork variations for the same swatch (for multiple artworks)
 */
function generateArtworkVariations(swatchName: string, index: number): string {
  const suffixes = ['Design', 'Pattern', 'Motif', 'Detail', 'Print', 'Draft', 'Final', 'Sample', 'Production'];
  const versionSuffix = ['v1', 'v2', 'final', 'draft', 'sample'];
  
  const baseName = generateArtworkNameFromSwatch(swatchName);
  
  // If it's the first artwork, use the base name
  if (index === 0) {
    return baseName;
  }
  
  // For subsequent artworks, add variation
  const suffix = faker.helpers.arrayElement(suffixes);
  const version = faker.helpers.arrayElement(versionSuffix);
  
  const templates = [
    () => `${baseName} – ${suffix}`,
    () => `${baseName} (${version})`,
    () => `${baseName} ${suffix} ${version}`,
    () => `${swatchName} ${suffix}`,
    () => `${baseName} – Variation ${index}`,
  ];
  
  return faker.helpers.arrayElement(templates)();
}

function generateArtworkCode(artworkId: number): string {
  const date = new Date();
  const year = date.getFullYear();
  return 'ART-' + year + '-' + String(artworkId).padStart(3, '0');
}

// ============================================
// Main Seed Function
// ============================================

export async function seedArtworks(count: number = 30): Promise<void> {
  console.log('\n🎨 Starting ArtworkSeeder with ' + count + ' artworks...\n');

  // Fetch swatch orders that can have artworks
  const swatchOrders = await db
    .select({
      id: swatchOrdersTable.id,
      swatchName: swatchOrdersTable.swatchName,
      orderCode: swatchOrdersTable.orderCode,
      orderStatus: swatchOrdersTable.orderStatus,
      clientName: swatchOrdersTable.clientName,
    })
    .from(swatchOrdersTable)
    .where(
      and(
        eq(swatchOrdersTable.isDeleted, false)
      )
    );

  console.log('   ✅ Found ' + swatchOrders.length + ' swatch orders');

  if (swatchOrders.length === 0) {
    console.warn('⚠️ No swatch orders found. Please run SwatchOrderSeeder first.');
    return;
  }

  // Scan for available images
  const availableImageCodes = await scanAvailableSwatchImageCodes();

  let artworkCounter = 1;
  let created = 0;

  // Generate artworks for each swatch order - at least 1 per order
  const artworksToCreate: ArtworkSeedData[] = [];

  // Determine how many total artworks to create (at least 1 per swatch order)
  const totalArtworks = Math.max(count, swatchOrders.length);
  
  for (const order of swatchOrders) {
    // Check if we've reached the total artworks limit
    if (created >= totalArtworks) break;
    
    // Calculate remaining artworks needed
    const remaining = totalArtworks - created;
    
    // Determine how many artworks for this order (at least 1, at most 3, but no more than remaining)
    const maxArtworks = Math.min(3, remaining);
    const numArtworks = faker.number.int({ min: 1, max: maxArtworks });
    
    for (let i = 0; i < numArtworks && created < totalArtworks; i++) {
      const isInhouse = faker.datatype.boolean({ probability: 0.7 });
      const workHours = faker.number.int({ min: 2, max: 40 }).toString();
      const hourlyRate = faker.number.int({ min: 50, max: 500 }).toString();
      const totalCost = (parseInt(workHours) * parseInt(hourlyRate)).toString();

      // Try to load images for this swatch
      let refImages: ImageItem[] = [];
      let wipImages: ImageItem[] = [];
      let finalImages: ImageItem[] = [];

      // First try to use the actual swatch code from the order
      let orderCode: string | null = null;

      if (order.orderCode && availableImageCodes.has(order.orderCode)) {
        orderCode = order.orderCode;
      } else if (availableImageCodes.size > 0) {
        // Fall back to a random swatch with images
        orderCode = faker.helpers.arrayElement(Array.from(availableImageCodes));
      }

      if (orderCode) {
        const images = await loadArtworkImages(orderCode);
        refImages = images.refImages;
        wipImages = images.wipImages;
        finalImages = images.finalImages;
        console.log('  📸 Loaded images from: ' + orderCode);
      } else {
        console.log('  ⚠️ No images available, using placeholders');
      }

      // Generate artwork name based on the swatch name
      const artworkName = generateArtworkVariations(order.swatchName, i);

      const artworkData: ArtworkSeedData = {
        swatchOrderId: order.id,
        artworkName: artworkName,
        unitLength: faker.number.int({ min: 10, max: 200 }).toString(),
        unitWidth: faker.number.int({ min: 10, max: 200 }).toString(),
        unitType: getRandomUnitType(),
        artworkCreated: isInhouse ? 'Inhouse' : 'Outsourced',
        workHours: workHours,
        hourlyRate: hourlyRate,
        totalCost: totalCost,
        feedbackStatus: getRandomFeedbackStatus(),
        files: [],
        refImages: refImages,
        wipImages: wipImages,
        finalImages: finalImages,
        createdBy: faker.helpers.arrayElement(['admin@zarierp.com', 'designer@zarierp.com', 'manager@zarierp.com']),
      };

      // If outsourced, add vendor details
      if (!isInhouse) {
        artworkData.outsourceVendorId = faker.string.numeric(5);
        artworkData.outsourceVendorName = faker.company.name() + ' ' + faker.helpers.arrayElement(['Studio', 'Designs', 'Creations', 'Arts']);
        artworkData.outsourcePaymentDate = faker.date.recent().toISOString().slice(0, 10);
        artworkData.outsourcePaymentAmount = faker.number.int({ min: 1000, max: 50000 }).toString();
        artworkData.outsourcePaymentMode = getRandomPaymentMode();
        artworkData.outsourceTransactionId = 'TXN-' + faker.string.alphanumeric(8).toUpperCase();
        artworkData.outsourcePaymentStatus = getRandomPaymentStatus();
      }

      artworksToCreate.push(artworkData);
      created++;
    }
  }

  console.log('\n📋 Generated ' + artworksToCreate.length + ' artworks for ' + swatchOrders.length + ' swatch orders');

  // Insert artworks sequentially
  for (const data of artworksToCreate) {
    const artworkCode = generateArtworkCode(artworkCounter);
    artworkCounter++;

    try {
      const [artwork] = await db.insert(artworksTable).values({
        artworkCode: artworkCode,
        swatchOrderId: data.swatchOrderId,
        artworkName: data.artworkName,
        unitLength: data.unitLength || null,
        unitWidth: data.unitWidth || null,
        unitType: data.unitType || null,
        artworkCreated: data.artworkCreated || 'Inhouse',
        workHours: data.workHours || null,
        hourlyRate: data.hourlyRate || null,
        totalCost: data.totalCost || null,
        outsourceVendorId: data.outsourceVendorId || null,
        outsourceVendorName: data.outsourceVendorName || null,
        outsourcePaymentDate: data.outsourcePaymentDate || null,
        outsourcePaymentAmount: data.outsourcePaymentAmount || null,
        outsourcePaymentMode: data.outsourcePaymentMode || null,
        outsourceTransactionId: data.outsourceTransactionId || null,
        outsourcePaymentStatus: data.outsourcePaymentStatus || null,
        feedbackStatus: data.feedbackStatus || 'Pending',
        files: data.files || [],
        refImages: data.refImages || [],
        wipImages: data.wipImages || [],
        finalImages: data.finalImages || [],
        createdBy: data.createdBy || 'system',
        createdAt: new Date(),
      }).returning();

      console.log('✅ Created artwork: ' + artworkCode + ' - ' + data.artworkName + ' (Swatch Order: ' + data.swatchOrderId + ')');
    } catch (error) {
      console.error('❌ Failed to create artwork: ' + data.artworkName, error);
    }
  }

  console.log('\n✅ ArtworkSeeder completed! Created ' + artworksToCreate.length + ' artworks for ' + swatchOrders.length + ' swatch orders.');
}

// ============================================
// Self-execution for ESM
// ============================================

var isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  var count = parseInt(process.argv[2]) || 30;
  seedArtworks(count).catch(console.error);
}