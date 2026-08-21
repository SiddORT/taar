import { db, swatchBomTable, swatchOrdersTable, materialsTable, fabricsTable, eq, and, sql } from "@workspace/db";
import { faker } from "@faker-js/faker";

// ============================================
// Types
// ============================================

interface MaterialOrFabric {
  id: number;
  code: string;
  name: string;
  type: 'material' | 'fabric';
  currentStock: string;
  avgUnitPrice: string;
  unitType: string;
  warehouseLocation: string;
}

// ============================================
// Helper Functions
// ============================================

function getRandomQuantity(maxStock: number): string {
  // Generate a random quantity between 1 and 20% of max stock, but at least 1 and at most maxStock
  const max = Math.min(maxStock, Math.max(1, Math.floor(maxStock * 0.2)));
  const qty = faker.number.int({ min: 1, max: Math.max(1, max) });
  return qty.toString();
}

function calculateEstimatedAmount(qty: string, price: string): string {
  const qtyNum = parseFloat(qty) || 0;
  const priceNum = parseFloat(price) || 0;
  return (qtyNum * priceNum).toFixed(2);
}

// ============================================
// Main Seed Function
// ============================================

export async function seedSwatchBom(count: number = 50): Promise<void> {
  console.log('\n📦 Starting SwatchBomSeeder with ' + count + ' BOM entries...\n');

  // 1. Fetch swatch orders that are not deleted
  const swatchOrders = await db
    .select({
      id: swatchOrdersTable.id,
      clientName: swatchOrdersTable.clientName,
    })
    .from(swatchOrdersTable)
    .where(eq(swatchOrdersTable.isDeleted, false))
    .limit(count * 2); // fetch more to have enough orders

  if (swatchOrders.length === 0) {
    console.warn('⚠️ No swatch orders found. Please run SwatchOrderSeeder first.');
    return;
  }
  console.log('   ✅ Found ' + swatchOrders.length + ' swatch orders');

  // 2. Fetch all active materials
  const materials = await db
    .select({
      id: materialsTable.id,
      materialCode: materialsTable.materialCode,
      materialName: materialsTable.materialName,
      currentStock: materialsTable.currentStock,
      unitPrice: materialsTable.unitPrice,
      unitType: materialsTable.unitType,
      location: materialsTable.location,
    })
    .from(materialsTable)
    .where(
      and(
        eq(materialsTable.isActive, true),
        eq(materialsTable.isDeleted, false)
      )
    );
  console.log('   ✅ Found ' + materials.length + ' materials');

  // 3. Fetch all active fabrics
  const fabrics = await db
    .select({
      id: fabricsTable.id,
      fabricCode: fabricsTable.fabricCode,
      fabricType: fabricsTable.fabricType,
      quality: fabricsTable.quality,
      colorName: fabricsTable.colorName,
      currentStock: fabricsTable.currentStock,
      pricePerMeter: fabricsTable.pricePerMeter,
      unitType: fabricsTable.unitType,
      location: fabricsTable.location,
    })
    .from(fabricsTable)
    .where(
      and(
        eq(fabricsTable.isActive, true),
        eq(fabricsTable.isDeleted, false)
      )
    );
  console.log('   ✅ Found ' + fabrics.length + ' fabrics');

  if (materials.length === 0 && fabrics.length === 0) {
    console.warn('⚠️ No materials or fabrics found. Please seed Materials and Fabrics first.');
    return;
  }

  // 4. Build a combined pool of items
  const itemPool: MaterialOrFabric[] = [];

  materials.forEach(m => {
    itemPool.push({
      id: m.id,
      code: m.materialCode,
      name: m.materialName || `${m.materialCode} - ${m.unitType}`,
      type: 'material',
      currentStock: m.currentStock || '0',
      avgUnitPrice: m.unitPrice || '0',
      unitType: m.unitType || '',
      warehouseLocation: m.location || '',
    });
  });

  fabrics.forEach(f => {
    const fabricName = `${f.fabricType} - ${f.quality} (${f.colorName})`;
    itemPool.push({
      id: f.id,
      code: f.fabricCode,
      name: fabricName,
      type: 'fabric',
      currentStock: f.currentStock || '0',
      avgUnitPrice: f.pricePerMeter || '0',
      unitType: f.unitType || 'Meter',
      warehouseLocation: f.location || '',
    });
  });

  console.log('   📋 Total items available: ' + itemPool.length);

  // 5. Generate BOM entries for each swatch order
  let totalInserted = 0;

  for (const order of swatchOrders) {
    // Determine how many BOM entries for this order (1-4)
    const numItems = faker.number.int({ min: 1, max: Math.min(4, itemPool.length) });

    // Pick random items without replacement for this order
    const selectedItems = faker.helpers.arrayElements(itemPool, numItems);

    for (const item of selectedItems) {
      const stockNum = parseFloat(item.currentStock) || 0;
      if (stockNum <= 0) {
        // Skip items with zero stock (or we can set a default small quantity)
        console.log(`  ⚠️ Skipping ${item.code} (stock 0) for order ${order.id}`);
        continue;
      }

      const requiredQty = getRandomQuantity(stockNum);
      const estimatedAmount = calculateEstimatedAmount(requiredQty, item.avgUnitPrice);

      // Check if this BOM entry already exists for this order and item
      // To avoid duplicates, we can check by swatchOrderId + materialType + materialId
      // But we'll rely on the runner to truncate the table before seeding.
      // However, to be safe, we'll check and skip if exists.
      const existing = await db
        .select({ id: swatchBomTable.id })
        .from(swatchBomTable)
        .where(
          and(
            eq(swatchBomTable.swatchOrderId, order.id),
            eq(swatchBomTable.materialType, item.type),
            eq(swatchBomTable.materialId, item.id)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        console.log(`  ⏭️ Skipping duplicate BOM entry for order ${order.id}, ${item.code}`);
        continue;
      }

      // Insert the BOM entry
      const insertData = {
        swatchOrderId: order.id,
        styleOrderId: null, // Not used for swatch orders
        materialType: item.type,
        materialId: item.id,
        materialCode: item.code,
        materialName: item.name,
        currentStock: item.currentStock,
        avgUnitPrice: item.avgUnitPrice,
        unitType: item.unitType,
        warehouseLocation: item.warehouseLocation,
        requiredQty: requiredQty,
        estimatedAmount: estimatedAmount,
        consumedQty: '0',
        targetVendorId: null,
        targetVendorName: null,
        createdBy: faker.helpers.arrayElement(['system', 'admin@taar.com']),
        createdAt: new Date(),
        updatedBy: null,
        updatedAt: null,
        isDeleted: false,
        deletedBy: null,
        deletedAt: null,
      };

      try {
        await db.insert(swatchBomTable).values(insertData);
        totalInserted++;
        console.log(`  ✅ Inserted BOM: ${item.code} (${item.type}) for order ${order.id} - Qty: ${requiredQty}, Est: ${estimatedAmount}`);
      } catch (error) {
        console.error(`  ❌ Failed to insert BOM for order ${order.id}, item ${item.code}:`, error);
      }
    }
  }

  console.log(`\n✅ SwatchBomSeeder completed! Inserted ${totalInserted} BOM entries.`);
}

// ============================================
// Self-execution for ESM
// ============================================

var isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  var count = parseInt(process.argv[2]) || 50;
  seedSwatchBom(count).catch(console.error);
}