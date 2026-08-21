import {
  db,
  styleOrdersTable,
  swatchBomTable,
  fabricsTable,
  materialsTable,
  usersTable,
  eq,
} from "@workspace/db";
import { faker } from "@faker-js/faker";

// ============================================
// Types
// ============================================

interface LocationStock {
  location: string;
  stock: string;
}

interface SourceItem {
  id: number;
  code: string;
  name: string;
  unitType: string;
  price: string;
  totalStock: string;
  locationStocks: LocationStock[];
}

// ============================================
// Helper Functions
// ============================================

function getRandomQty(): string {
  return faker.number.int({ min: 1, max: 100 }).toString();
}

function getRandomUserEmail(users: { email: string }[]): string {
  return users.length > 0 ? faker.helpers.arrayElement(users).email : "system";
}

function pickLocationWithStock(locationStocks: LocationStock[]): string | null {
  const available = locationStocks.filter((ls) => parseFloat(ls.stock) > 0);
  if (available.length === 0) return null;
  return faker.helpers.arrayElement(available).location;
}

// ============================================
// Main Seed Function
// ============================================

export async function seedStyleBom(count: number = 30): Promise<void> {
  console.log(`\n📦 Starting StyleBomSeeder (ignoring count, generating 1-5 per order)...\n`);

  // 1. Fetch style orders (non-deleted)
  const styleOrders = await db
    .select({
      id: styleOrdersTable.id,
      orderCode: styleOrdersTable.orderCode,
      styleName: styleOrdersTable.styleName,
    })
    .from(styleOrdersTable)
    .where(eq(styleOrdersTable.isDeleted, false));

  console.log(`   ✅ Found ${styleOrders.length} style orders`);
  if (styleOrders.length === 0) {
    console.warn("⚠️ No style orders found. Please seed style orders first.");
    return;
  }

  // 2. Fetch active users
  const users = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.isActive, true));

  if (users.length === 0) console.warn("⚠️ No active users. Using 'system'.");

  // 3. Fetch fabrics with stock locations
  const fabrics = await db
    .select({
      id: fabricsTable.id,
      code: fabricsTable.fabricCode,
      name: fabricsTable.colorName,
      unitType: fabricsTable.unitType,
      price: fabricsTable.pricePerMeter,
      totalStock: fabricsTable.currentStock,
      locationStocks: fabricsTable.locationStocks,
    })
    .from(fabricsTable)
    .where(eq(fabricsTable.isDeleted, false));

  const usableFabrics = fabrics
    .filter((f) => f.locationStocks.some((ls) => parseFloat(ls.stock) > 0))
    .map((f) => ({
      ...f,
      name: f.name ?? f.code,
    }));

  // 4. Fetch materials with stock locations
  const materials = await db
    .select({
      id: materialsTable.id,
      code: materialsTable.materialCode,
      name: materialsTable.materialName,
      unitType: materialsTable.unitType,
      price: materialsTable.unitPrice,
      totalStock: materialsTable.currentStock,
      locationStocks: materialsTable.locationStocks,
    })
    .from(materialsTable)
    .where(eq(materialsTable.isDeleted, false));

  const usableMaterials = materials
    .filter((m) => m.locationStocks.some((ls) => parseFloat(ls.stock) > 0))
    .map((m) => ({
      ...m,
      name: m.name ?? m.code,
    }));

  console.log(`   ✅ ${usableFabrics.length} fabrics, ${usableMaterials.length} materials with stock available`);

  const sourcePool: (SourceItem & { sourceType: "fabric" | "material" })[] = [
    ...usableFabrics.map((f) => ({ ...f, sourceType: "fabric" as const })),
    ...usableMaterials.map((m) => ({ ...m, sourceType: "material" as const })),
  ];

  if (sourcePool.length === 0) {
    console.warn("⚠️ No fabrics or materials with stock. Cannot create BOM entries.");
    return;
  }

  // ============================================
  // Generate 1-5 entries per style order
  // ============================================
  const bomEntries: any[] = [];

  for (const order of styleOrders) {
    // Random number of entries between 1 and 5
    const numEntries = faker.number.int({ min: 1, max: 5 });

    for (let i = 0; i < numEntries; i++) {
      const source = faker.helpers.arrayElement(sourcePool);
      const location = pickLocationWithStock(source.locationStocks);
      if (!location) continue; // should never happen because we filtered

      const requiredQty = getRandomQty();
      const price = parseFloat(source.price) || 0;
      const qtyNum = parseFloat(requiredQty) || 0;
      const estimatedAmount = (qtyNum * price).toFixed(2);

      bomEntries.push({
        styleOrderId: order.id,
        swatchOrderId: null,
        materialType: source.sourceType,
        materialId: source.id,
        materialCode: source.code,
        materialName: source.name,
        currentStock: source.totalStock,
        avgUnitPrice: source.price,
        unitType: source.unitType,
        warehouseLocation: location,
        requiredQty,
        estimatedAmount,
        consumedQty: "0",
        targetVendorId: null,
        targetVendorName: null,
        createdBy: getRandomUserEmail(users),
        createdAt: new Date(),
        isDeleted: false,
      });
    }
  }

  console.log(`\n📋 Generated ${bomEntries.length} BOM entries across ${styleOrders.length} style orders`);

  // Insert sequentially
  for (const entry of bomEntries) {
    try {
      await db.insert(swatchBomTable).values(entry);
      console.log(`✅ BOM for order ${entry.styleOrderId}: ${entry.materialName} (${entry.materialType})`);
    } catch (error) {
      console.error(`❌ Failed for order ${entry.styleOrderId}:`, error);
    }
  }

  console.log(`\n✅ StyleBomSeeder completed.`);
}

// ============================================
// Self-execution
// ============================================

const isMainModule = import.meta.url === "file://" + process.argv[1];
if (isMainModule) {
  const count = parseInt(process.argv[2]) || 30;
  seedStyleBom(count).catch(console.error);
}