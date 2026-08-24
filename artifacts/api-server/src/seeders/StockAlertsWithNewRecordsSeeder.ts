import {
  db,
  materialsTable,
  fabricsTable,
  inventoryItemsTable,
  warehouseLocations,
  unitTypesTable,
  fabricTypesTable,
  hsnTable,
  vendorsTable,
  sql,
} from "@workspace/db";
import { eq, and, like } from "drizzle-orm";

// ---------- Configuration ----------
const LOW_STOCK_COUNT = 15;
const OUT_OF_STOCK_COUNT = 10;

const MATERIAL_TYPES = ["Fabric", "Trim", "Embellishment", "Accessory", "Lining", "Interlining", "Label", "Packaging"];
const COLORS = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Red", hex: "#FF0000" },
  { name: "Blue", hex: "#1E3A8A" },
  { name: "Green", hex: "#22C55E" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Grey", hex: "#808080" },
  { name: "Burgundy", hex: "#800020" },
];
const QUALITIES = ["Premium", "Standard", "Fine", "Economy", "Luxury"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------- Code generators using `like` to avoid parameter-type errors ----------
async function generateMaterialCode(tx: any): Promise<string> {
  const prefix = "MAT";
  const result = await tx
    .select({ code: materialsTable.materialCode })
    .from(materialsTable)
    .where(like(materialsTable.materialCode, `${prefix}%`))
    .orderBy(sql`${materialsTable.materialCode} DESC`)
    .limit(1);
  let seq = 1;
  if (result.length > 0) {
    const last = result[0].code;
    const num = parseInt(last.replace(prefix, ""), 10);
    if (!isNaN(num)) seq = num + 1;
  }
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

async function generateFabricCode(tx: any): Promise<string> {
  const prefix = "FAB";
  const result = await tx
    .select({ code: fabricsTable.fabricCode })
    .from(fabricsTable)
    .where(like(fabricsTable.fabricCode, `${prefix}%`))
    .orderBy(sql`${fabricsTable.fabricCode} DESC`)
    .limit(1);
  let seq = 1;
  if (result.length > 0) {
    const last = result[0].code;
    const num = parseInt(last.replace(prefix, ""), 10);
    if (!isNaN(num)) seq = num + 1;
  }
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export async function seedStockAlertsWithNewRecords(): Promise<void> {
  // Idempotency: skip if any material/fabric with createdBy = 'seeder_alert' exists
  const existingMaterial = await db
    .select({ id: materialsTable.id })
    .from(materialsTable)
    .where(eq(materialsTable.createdBy, "seeder_alert"))
    .limit(1);
  const existingFabric = await db
    .select({ id: fabricsTable.id })
    .from(fabricsTable)
    .where(eq(fabricsTable.createdBy, "seeder_alert"))
    .limit(1);

  if (existingMaterial.length > 0 || existingFabric.length > 0) {
    console.log("[seedStockAlertsWithNewRecords] Records already seeded. Skipping.");
    return;
  }

  // Fetch active warehouses
  const warehouses = await db
    .select({ name: warehouseLocations.name })
    .from(warehouseLocations)
    .where(eq(warehouseLocations.isActive, true));
  if (warehouses.length === 0) {
    throw new Error("No active warehouses found. Please seed warehouse locations first.");
  }
  const warehouseNames = warehouses.map(w => w.name);
  const defaultMatWarehouse = warehouseNames[0] || "Warehouse A";
  const defaultFabWarehouse = warehouseNames[1] || warehouseNames[0] || "Warehouse B";

  // Fetch dependent data
  const unitTypes = await db
    .select({ name: unitTypesTable.name })
    .from(unitTypesTable)
    .where(and(eq(unitTypesTable.isActive, true), eq(unitTypesTable.isDeleted, false)));
  const unitTypeNames = unitTypes.map(u => u.name);

  const fabricTypes = await db
    .select({ name: fabricTypesTable.name })
    .from(fabricTypesTable)
    .where(and(eq(fabricTypesTable.isActive, true), eq(fabricTypesTable.isDeleted, false)));
  const fabricTypeNames = fabricTypes.map(f => f.name);

  const hsnData = await db
    .select({ hsnCode: hsnTable.hsnCode, gstPercent: hsnTable.gstPercentage })
    .from(hsnTable)
    .where(and(eq(hsnTable.isActive, true), eq(hsnTable.isDeleted, false)));

  const vendors = await db
    .select({ brandName: vendorsTable.brandName })
    .from(vendorsTable)
    .where(and(eq(vendorsTable.isActive, true), eq(vendorsTable.isDeleted, false)));
  const vendorNames = vendors.map(v => v.brandName);

  // Fallbacks
  const fallbackUnitTypes = ["Meter", "Piece", "Kilogram", "Gram", "Liter"];
  const fallbackFabricTypes = ["Cotton", "Denim", "Silk", "Linen", "Polyester", "Wool", "Satin", "Canvas", "Viscose", "Tweed", "Chiffon", "Jacquard", "Nylon", "Lace", "Fleece"];
  const fallbackHsn = [
    { hsnCode: "520811", gstPercent: "5" },
    { hsnCode: "520912", gstPercent: "12" },
    { hsnCode: "540710", gstPercent: "18" },
    { hsnCode: "551311", gstPercent: "5" },
    { hsnCode: "620342", gstPercent: "12" },
    { hsnCode: "580421", gstPercent: "5" },
    { hsnCode: "960621", gstPercent: "18" },
    { hsnCode: "481910", gstPercent: "18" },
  ];
  const fallbackVendors = ["Arvind Mills", "Raymond", "Sutlej Textiles", "Reliance Textiles", "Vardhman Textiles", "Jaya Textiles", "Bombay Dyeing", "Garden Silk Mills", "Trident Group", "Welspun India", "Indo Count Industries"];

  const finalUnitTypes = unitTypeNames.length > 0 ? unitTypeNames : fallbackUnitTypes;
  const finalFabricTypes = fabricTypeNames.length > 0 ? fabricTypeNames : fallbackFabricTypes;
  const finalHsn = hsnData.length > 0 ? hsnData : fallbackHsn;
  const finalVendors = vendorNames.length > 0 ? vendorNames : fallbackVendors;

  console.log(`[seedStockAlertsWithNewRecords] Using ${finalUnitTypes.length} unit types, ${finalFabricTypes.length} fabric types, ${finalHsn.length} HSN codes, ${finalVendors.length} vendors.`);

  await db.transaction(async (tx) => {
    // ----- Create LOW-STOCK Materials -----
    for (let i = 0; i < LOW_STOCK_COUNT; i++) {
      const materialCode = await generateMaterialCode(tx);
      const color = randomItem(COLORS);
      const quality = randomItem(QUALITIES);
      const type = randomItem(MATERIAL_TYPES);
      const unitType = randomItem(finalUnitTypes);
      const hsn = randomItem(finalHsn);
      const vendor = randomItem(finalVendors);
      const reorderLevel = randomInt(5, 20);
      const currentStock = randomInt(1, Math.max(1, reorderLevel - 1));
      const unitPrice = (randomInt(50, 500) / 10).toFixed(2);

      // Insert material – skip on conflict
      const [inserted] = await tx
        .insert(materialsTable)
        .values({
          materialCode,
          materialName: `${type} - ${quality} - ${color.name} (Alert)`,
          quality,
          type,
          color: color.name,
          hexCode: color.hex,
          colorName: color.name,
          size: String(randomInt(40, 60)),
          unitPrice,
          unitType,
          currentStock: String(currentStock),
          locationStocks: [{ location: defaultMatWarehouse, stock: String(currentStock) }],
          hsnCode: hsn.hsnCode,
          gstPercent: hsn.gstPercent,
          vendor,
          location: defaultMatWarehouse,
          reorderLevel: String(reorderLevel),
          minimumLevel: String(Math.floor(reorderLevel * 0.5)),
          maximumLevel: String(reorderLevel * 3),
          images: [
            {
              id: `img-${materialCode.toLowerCase()}`,
              name: `${color.name.toLowerCase()}.jpg`,
              url: `/uploads/materials/images/${color.name.toLowerCase()}.jpg`,
              size: 1024,
            },
          ],
          createdBy: "seeder_alert",
        })
        .onConflictDoNothing()
        .returning({ id: materialsTable.id });

      if (!inserted) {
        console.warn(`[seedStockAlerts] Material ${materialCode} already exists. Skipping.`);
        continue;
      }

      // Insert inventory item – skip on conflict
      await tx
        .insert(inventoryItemsTable)
        .values({
          sourceType: "material",
          sourceId: inserted.id,
          itemName: `${type} - ${quality} - ${color.name} (Alert)`,
          itemCode: materialCode,
          category: type,
          department: null,
          warehouseLocation: defaultMatWarehouse,
          unitType,
          currentStock: String(currentStock),
          styleReservedQty: "0",
          swatchReservedQty: "0",
          availableStock: String(currentStock),
          averagePrice: unitPrice,
          lastPurchasePrice: unitPrice,
          minimumLevel: String(Math.floor(reorderLevel * 0.5)),
          reorderLevel: String(reorderLevel),
          maximumLevel: String(reorderLevel * 3),
          preferredVendor: vendor,
          lastVendor: null,
          images: [
            {
              id: `img-${materialCode.toLowerCase()}`,
              name: `${color.name.toLowerCase()}.jpg`,
              url: `/uploads/materials/images/${color.name.toLowerCase()}.jpg`,
              size: 1024,
            },
          ],
        })
        .onConflictDoNothing();

      console.log(`[seedStockAlerts] Low‑stock material ${materialCode} created with stock ${currentStock}`);
    }

    // ----- Create OUT-OF-STOCK Fabrics -----
    for (let i = 0; i < OUT_OF_STOCK_COUNT; i++) {
      const fabricCode = await generateFabricCode(tx);
      const color = randomItem(COLORS);
      const quality = randomItem(QUALITIES);
      const fabricType = randomItem(finalFabricTypes);
      const unitType = "Meter";
      const hsn = randomItem(finalHsn);
      const vendor = randomItem(finalVendors);
      const reorderLevel = randomInt(5, 20);
      const unitPrice = (randomInt(100, 800) / 10).toFixed(2);

      const [inserted] = await tx
        .insert(fabricsTable)
        .values({
          fabricCode,
          fabricType,
          quality,
          color: color.name,
          hexCode: color.hex,
          colorName: color.name,
          width: String(randomInt(44, 62)),
          height: String(randomInt(50, 120)),
          pricePerMeter: unitPrice,
          unitType,
          currentStock: "0",
          hsnCode: hsn.hsnCode,
          gstPercent: hsn.gstPercent,
          vendor,
          location: defaultFabWarehouse,
          locationStocks: [{ location: defaultFabWarehouse, stock: "0" }],
          reorderLevel: String(reorderLevel),
          minimumLevel: String(Math.floor(reorderLevel * 0.5)),
          maximumLevel: String(reorderLevel * 3),
          images: [
            {
              id: `img-${fabricCode.toLowerCase()}`,
              name: `${color.name.toLowerCase()}.jpg`,
              url: `/uploads/fabrics/images/${color.name.toLowerCase()}.jpg`,
              size: 2048,
            },
          ],
          createdBy: "seeder_alert",
        })
        .onConflictDoNothing()
        .returning({ id: fabricsTable.id });

      if (!inserted) {
        console.warn(`[seedStockAlerts] Fabric ${fabricCode} already exists. Skipping.`);
        continue;
      }

      // Insert inventory item – skip on conflict
      await tx
        .insert(inventoryItemsTable)
        .values({
          sourceType: "fabric",
          sourceId: inserted.id,
          itemName: `${fabricType} - ${quality} - ${color.name} (Alert)`,
          itemCode: fabricCode,
          category: fabricType,
          department: null,
          warehouseLocation: defaultFabWarehouse,
          unitType,
          currentStock: "0",
          styleReservedQty: "0",
          swatchReservedQty: "0",
          availableStock: "0",
          averagePrice: unitPrice,
          lastPurchasePrice: unitPrice,
          minimumLevel: String(Math.floor(reorderLevel * 0.5)),
          reorderLevel: String(reorderLevel),
          maximumLevel: String(reorderLevel * 3),
          preferredVendor: vendor,
          lastVendor: null,
          images: [
            {
              id: `img-${fabricCode.toLowerCase()}`,
              name: `${color.name.toLowerCase()}.jpg`,
              url: `/uploads/fabrics/images/${color.name.toLowerCase()}.jpg`,
              size: 2048,
            },
          ],
        })
        .onConflictDoNothing();

      console.log(`[seedStockAlerts] Out‑of‑stock fabric ${fabricCode} created.`);
    }
  });

  console.log(
    `[seedStockAlertsWithNewRecords] Completed. Created ${LOW_STOCK_COUNT} low‑stock materials and ${OUT_OF_STOCK_COUNT} out‑of‑stock fabrics.`
  );
}