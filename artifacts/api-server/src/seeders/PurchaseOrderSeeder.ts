import { db, eq, and, sql } from "@workspace/db";
import { faker } from "@faker-js/faker";
import {
  swatchBomTable,
  swatchOrdersTable,
  vendorsTable,
  inventoryItemsTable,
  purchaseOrdersTable,
  purchaseOrderItems,
} from "@workspace/db";

// ============================================
// Types
// ============================================

interface BomItem {
  id: number;
  swatchOrderId: number;
  materialType: 'material' | 'fabric';
  materialId: number;
  materialCode: string;
  materialName: string;
  currentStock: string;
  avgUnitPrice: string;
  unitType: string;
  warehouseLocation: string;
  requiredQty: string;
  estimatedAmount: string;
  consumedQty: string;
  targetVendorId: number | null;
  targetVendorName: string | null;
}

interface Vendor {
  id: number;
  brandName: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a PO number in format PO-YY-XXXX
 */
async function generatePoNumber(): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);

  // Query the latest PO number for this year
  const result = await db
    .select({ poNumber: purchaseOrdersTable.poNumber })
    .from(purchaseOrdersTable)
    .where(and(
      sql`${purchaseOrdersTable.poNumber} LIKE ${'PO-' + year + '-%'}`,
      eq(purchaseOrdersTable.isDeleted, false)
    ))
    .orderBy(sql`${purchaseOrdersTable.poNumber} DESC`)
    .limit(1);

  let nextSeq = 1;
  if (result.length > 0) {
    const lastPo = result[0].poNumber;
    const parts = lastPo.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) {
        nextSeq = seq + 1;
      }
    }
  }

  const seqStr = String(nextSeq).padStart(4, '0');
  return `PO-${year}-${seqStr}`;
}

/**
 * Get a random vendor
 */
async function getRandomVendor(): Promise<Vendor | null> {
  const vendors = await db
    .select({ id: vendorsTable.id, brandName: vendorsTable.brandName })
    .from(vendorsTable)
    .where(eq(vendorsTable.isDeleted, false))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (vendors.length === 0) {
    return null;
  }
  return vendors[0];
}

/**
 * Get inventory item by code
 */
async function getInventoryItemByCode(code: string): Promise<{ id: number; averagePrice: string } | null> {
  const items = await db
    .select({ id: inventoryItemsTable.id, averagePrice: inventoryItemsTable.averagePrice })
    .from(inventoryItemsTable)
    .where(and(
      eq(inventoryItemsTable.itemCode, code),
      eq(inventoryItemsTable.isDeleted, false)
    ))
    .limit(1);

  if (items.length === 0) {
    return null;
  }
  return items[0];
}

/**
 * Check if a PO already exists for a BOM row
 */
async function poExistsForBomRow(bomRowId: number): Promise<boolean> {
  const result = await db
    .select({ id: purchaseOrdersTable.id })
    .from(purchaseOrdersTable)
    .where(and(
      sql`${purchaseOrdersTable.bomRowIds} @> ${JSON.stringify([bomRowId])}::jsonb`,
      eq(purchaseOrdersTable.isDeleted, false)
    ))
    .limit(1);

  return result.length > 0;
}

// ============================================
// Main Seed Function
// ============================================

export async function seedPurchaseOrders(count: number = 0): Promise<void> {
  console.log(`\n📦 Starting PurchaseOrderSeeder...`);

  // 1. Fetch BOM entries that have required quantity > 0 and are not deleted
  const bomEntries = await db
    .select({
      id: swatchBomTable.id,
      swatchOrderId: swatchBomTable.swatchOrderId,
      materialType: swatchBomTable.materialType,
      materialId: swatchBomTable.materialId,
      materialCode: swatchBomTable.materialCode,
      materialName: swatchBomTable.materialName,
      currentStock: swatchBomTable.currentStock,
      avgUnitPrice: swatchBomTable.avgUnitPrice,
      unitType: swatchBomTable.unitType,
      warehouseLocation: swatchBomTable.warehouseLocation,
      requiredQty: swatchBomTable.requiredQty,
      estimatedAmount: swatchBomTable.estimatedAmount,
      consumedQty: swatchBomTable.consumedQty,
      targetVendorId: swatchBomTable.targetVendorId,
      targetVendorName: swatchBomTable.targetVendorName,
    })
    .from(swatchBomTable)
    .where(and(
      eq(swatchBomTable.isDeleted, false),
      sql`CAST(${swatchBomTable.requiredQty} AS NUMERIC) > 0`
    ));

  console.log(`   ✅ Found ${bomEntries.length} BOM entries with required quantity > 0`);

  if (bomEntries.length === 0) {
    console.warn('⚠️ No BOM entries found with required quantity > 0. Please run SwatchBomSeeder first.');
    return;
  }

  // 2. Fetch all vendors for reference
  const allVendors = await db
    .select({ id: vendorsTable.id, brandName: vendorsTable.brandName })
    .from(vendorsTable)
    .where(eq(vendorsTable.isDeleted, false));
  console.log(`   ✅ Found ${allVendors.length} vendors`);

  // 3. Determine how many to process
  let entriesToProcess = bomEntries;
  if (count > 0 && count < bomEntries.length) {
    // Shuffle the array to get a random subset
    const shuffled = faker.helpers.shuffle(bomEntries);
    entriesToProcess = shuffled.slice(0, count);
    console.log(`   🔀 Processing a random subset of ${count} entries out of ${bomEntries.length}`);
  } else {
    console.log(`   📋 Processing all ${bomEntries.length} entries`);
  }

  // 4. Create POs
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const bom of entriesToProcess) {
    // Skip if PO already exists for this BOM row
    const exists = await poExistsForBomRow(bom.id);
    if (exists) {
      console.log(`  ⏭️ Skipping BOM ${bom.id} - PO already exists`);
      skipped++;
      continue;
    }

    // Determine vendor
    let vendorId: number | null = bom.targetVendorId;
    let vendorName: string | null = bom.targetVendorName;

    if (!vendorId && !vendorName) {
      // Assign a random vendor
      const randomVendor = await getRandomVendor();
      if (randomVendor) {
        vendorId = randomVendor.id;
        vendorName = randomVendor.brandName;
      } else {
        // No vendors at all, skip
        console.warn(`  ⚠️ No vendors found, skipping BOM ${bom.id}`);
        skipped++;
        continue;
      }
    }

    // If we have vendorId but no name, fetch the name
    if (vendorId && !vendorName) {
      const vendor = allVendors.find(v => v.id === vendorId);
      if (vendor) {
        vendorName = vendor.brandName;
      } else {
        vendorName = `Vendor ${vendorId}`;
      }
    }

    // Fallback name if still null
    if (!vendorName) {
      vendorName = 'Unknown Vendor';
    }

    // Get inventory item
    const inventoryItem = await getInventoryItemByCode(bom.materialCode);
    if (!inventoryItem) {
      console.warn(`  ⚠️ No inventory item found for code ${bom.materialCode}, skipping BOM ${bom.id}`);
      skipped++;
      continue;
    }

    // Generate PO number
    const poNumber = await generatePoNumber();

    // Determine unit price - use avgUnitPrice from BOM, or fallback to inventory average price
    let unitPrice = bom.avgUnitPrice || inventoryItem.averagePrice || '0';

    // Create the PO line item (bom item)
    const bomItem = {
      bomRowId: bom.id,
      quantity: bom.requiredQty,
      unitType: bom.unitType || '',
      targetPrice: unitPrice,
      materialCode: bom.materialCode,
      materialName: bom.materialName,
      targetVendorId: vendorId,
      targetVendorName: vendorName,
    };

    try {
      // Start transaction
      const result = await db.transaction(async (tx) => {
        // Insert purchase order header
        const [po] = await tx
          .insert(purchaseOrdersTable)
          .values({
            poNumber: poNumber,
            swatchOrderId: bom.swatchOrderId,
            styleOrderId: null,
            referenceType: 'Swatch',
            referenceId: bom.swatchOrderId,
            vendorMode: 'header',
            vendorId: vendorId,
            vendorName: vendorName,
            status: 'Draft',
            notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || null,
            bomRowIds: [bom.id],
            bomItems: [bomItem],
            createdBy: faker.helpers.arrayElement(['system', 'admin@taar.com']),
            createdAt: new Date(),
            updatedBy: null,
            updatedAt: null,
            isDeleted: false,
          })
          .returning({ id: purchaseOrdersTable.id });

        // Insert purchase order item
        await tx
          .insert(purchaseOrderItems)
          .values({
            poId: po.id,
            inventoryItemId: inventoryItem.id,
            itemName: bom.materialName,
            itemCode: bom.materialCode,
            orderedQuantity: bom.requiredQty,
            receivedQuantity: '0',
            unitPrice: unitPrice,
            warehouseLocation: bom.warehouseLocation || '',
            remarks: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) || null,
            itemImage: null,
            vendorId: vendorId,
            vendorName: vendorName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDeleted: false,
            deletedBy: null,
            deletedAt: null,
          });

        return po;
      });

      created++;
      console.log(`  ✅ Created PO ${poNumber} for BOM ${bom.id} - ${bom.materialName} (Vendor: ${vendorName})`);
    } catch (error) {
      console.error(`  ❌ Failed to create PO for BOM ${bom.id}:`, error);
      failed++;
    }
  }

  console.log(`\n✅ PurchaseOrderSeeder completed! Created ${created} POs, skipped ${skipped}, failed ${failed}.`);
}

// ============================================
// Self-execution for ESM
// ============================================

var isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  // Parse count from command line: default 0 means all
  var count = parseInt(process.argv[2]) || 0;
  seedPurchaseOrders(count).catch(console.error);
}