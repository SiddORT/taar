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
  inArray,
} from "@workspace/db";
import { eq, and, like, ilike } from "drizzle-orm";

// ---------- Hardcoded Material Master ----------
interface HardcodedMaterial {
  materialName: string;
  type: string;
  quality: string;
  color: string;
  hexCode: string;
  size: string;
  unitType: string;
  currentStock: number;
  reorderLevel: number;
  unitPrice: string;
  hsnCode: string;
  gstPercent: string;
  vendor: string;
  imageFileName: string;
}

const MATERIAL_MASTER: HardcodedMaterial[] = [
  {
    materialName: "Polyester Sewing Thread 40/2",
    type: "Trim",
    quality: "Standard",
    color: "White",
    hexCode: "#FFFFFF",
    size: "40/2",
    unitType: "Piece",
    currentStock: 8,
    reorderLevel: 15,
    unitPrice: "25.50",
    hsnCode: "520411",
    gstPercent: "5",
    vendor: "Arvind Mills",
    imageFileName: "polyester-sewing-thread-40-2.jpg",
  },
  {
    materialName: "Metal Zipper #5 Closed End",
    type: "Trim",
    quality: "Premium",
    color: "Black",
    hexCode: "#000000",
    size: "#5",
    unitType: "Piece",
    currentStock: 5,
    reorderLevel: 12,
    unitPrice: "45.00",
    hsnCode: "960711",
    gstPercent: "18",
    vendor: "Raymond",
    imageFileName: "metal-zipper-5-closed-end.jpg",
  },
  {
    materialName: "Coats Astra Button 18L",
    type: "Trim",
    quality: "Premium",
    color: "White",
    hexCode: "#FFFFFF",
    size: "18L",
    unitType: "Piece",
    currentStock: 10,
    reorderLevel: 20,
    unitPrice: "12.00",
    hsnCode: "960621",
    gstPercent: "18",
    vendor: "Sutlej Textiles",
    imageFileName: "coats-astra-button-18l.jpg",
  },
  {
    materialName: "Woven Elastic Band 25mm",
    type: "Trim",
    quality: "Standard",
    color: "Black",
    hexCode: "#000000",
    size: "25mm",
    unitType: "Meter",
    currentStock: 3,
    reorderLevel: 10,
    unitPrice: "18.75",
    hsnCode: "580610",
    gstPercent: "12",
    vendor: "Reliance Textiles",
    imageFileName: "woven-elastic-band-25mm.jpg",
  },
  {
    materialName: "Snap Button Set 15mm",
    type: "Trim",
    quality: "Standard",
    color: "Silver",
    hexCode: "#C0C0C0",
    size: "15mm",
    unitType: "Piece",
    currentStock: 6,
    reorderLevel: 15,
    unitPrice: "8.50",
    hsnCode: "960621",
    gstPercent: "18",
    vendor: "Vardhman Textiles",
    imageFileName: "snap-button-set-15mm.jpg",
  },
  {
    materialName: "Round Sequin 8mm Paillette",
    type: "Embellishment",
    quality: "Luxury",
    color: "Gold",
    hexCode: "#D4AF37",
    size: "8mm",
    unitType: "Gram",
    currentStock: 4,
    reorderLevel: 12,
    unitPrice: "85.00",
    hsnCode: "701810",
    gstPercent: "18",
    vendor: "Jaya Textiles",
    imageFileName: "round-sequin-8mm-paillette.jpg",
  },
  {
    materialName: "Glass Seed Bead 2mm",
    type: "Embellishment",
    quality: "Fine",
    color: "Silver",
    hexCode: "#C0C0C0",
    size: "2mm",
    unitType: "Gram",
    currentStock: 7,
    reorderLevel: 18,
    unitPrice: "120.00",
    hsnCode: "701810",
    gstPercent: "18",
    vendor: "Bombay Dyeing",
    imageFileName: "glass-seed-bead-2mm.jpg",
  },
  {
    materialName: "Embroidery Floss Anchor",
    type: "Embellishment",
    quality: "Standard",
    color: "Red",
    hexCode: "#FF0000",
    size: "Skein",
    unitType: "Piece",
    currentStock: 9,
    reorderLevel: 20,
    unitPrice: "15.00",
    hsnCode: "520411",
    gstPercent: "5",
    vendor: "Garden Silk Mills",
    imageFileName: "embroidery-floss-anchor.jpg",
  },
  {
    materialName: "Polyester Taffeta Lining 170T",
    type: "Lining",
    quality: "Standard",
    color: "Black",
    hexCode: "#000000",
    size: "170T",
    unitType: "Meter",
    currentStock: 8,
    reorderLevel: 16,
    unitPrice: "35.00",
    hsnCode: "540710",
    gstPercent: "18",
    vendor: "Trident Group",
    imageFileName: "polyester-taffeta-lining-170t.jpg",
  },
  {
    materialName: "Cotton Voile Lining 60s",
    type: "Lining",
    quality: "Premium",
    color: "White",
    hexCode: "#FFFFFF",
    size: "60s",
    unitType: "Meter",
    currentStock: 6,
    reorderLevel: 14,
    unitPrice: "55.00",
    hsnCode: "520811",
    gstPercent: "5",
    vendor: "Welspun India",
    imageFileName: "cotton-voile-lining-60s.jpg",
  },
  {
    materialName: "Fusible Interlining Medium Weight",
    type: "Interlining",
    quality: "Standard",
    color: "White",
    hexCode: "#FFFFFF",
    size: "Medium",
    unitType: "Meter",
    currentStock: 4,
    reorderLevel: 12,
    unitPrice: "42.00",
    hsnCode: "560314",
    gstPercent: "12",
    vendor: "Indo Count Industries",
    imageFileName: "fusible-interlining-medium-weight.jpg",
  },
  {
    materialName: "Non-Woven Interlining Light",
    type: "Interlining",
    quality: "Economy",
    color: "White",
    hexCode: "#FFFFFF",
    size: "Light",
    unitType: "Meter",
    currentStock: 10,
    reorderLevel: 20,
    unitPrice: "28.00",
    hsnCode: "560314",
    gstPercent: "12",
    vendor: "Arvind Mills",
    imageFileName: "non-woven-interlining-light.jpg",
  },
  {
    materialName: "Woven Main Label Satin",
    type: "Label",
    quality: "Premium",
    color: "Black",
    hexCode: "#000000",
    size: "50x20mm",
    unitType: "Piece",
    currentStock: 5,
    reorderLevel: 15,
    unitPrice: "3.50",
    hsnCode: "580710",
    gstPercent: "12",
    vendor: "Raymond",
    imageFileName: "woven-main-label-satin.jpg",
  },
  {
    materialName: "Printed Care Label Wash Instructions",
    type: "Label",
    quality: "Standard",
    color: "White",
    hexCode: "#FFFFFF",
    size: "60x30mm",
    unitType: "Piece",
    currentStock: 3,
    reorderLevel: 10,
    unitPrice: "2.00",
    hsnCode: "481910",
    gstPercent: "18",
    vendor: "Sutlej Textiles",
    imageFileName: "printed-care-label-wash-instructions.jpg",
  },
  {
    materialName: "Plastic Hanger 17 inch",
    type: "Accessory",
    quality: "Standard",
    color: "White",
    hexCode: "#FFFFFF",
    size: "17 inch",
    unitType: "Piece",
    currentStock: 2,
    reorderLevel: 10,
    unitPrice: "22.00",
    hsnCode: "392690",
    gstPercent: "18",
    vendor: "Reliance Textiles",
    imageFileName: "plastic-hanger-17-inch.jpg",
  },
  {
    materialName: "LDPE Polybag 12x16 inch",
    type: "Packaging",
    quality: "Standard",
    color: "White",
    hexCode: "#FFFFFF",
    size: "12x16",
    unitType: "Piece",
    currentStock: 6,
    reorderLevel: 15,
    unitPrice: "5.50",
    hsnCode: "392321",
    gstPercent: "18",
    vendor: "Vardhman Textiles",
    imageFileName: "ldpe-polybag-12x16-inch.jpg",
  },
];

// ---------- Hardcoded Fabric Master ----------
interface HardcodedFabric {
  fabricType: string;
  quality: string;
  color: string;
  hexCode: string;
  width: string;
  height: string;
  pricePerMeter: string;
  unitType: string;
  reorderLevel: number;
  hsnCode: string;
  gstPercent: string;
  vendor: string;
  imageFileName: string;
}

const FABRIC_MASTER: HardcodedFabric[] = [
  {
    fabricType: "Cotton Poplin",
    quality: "Premium",
    color: "White",
    hexCode: "#FFFFFF",
    width: "58",
    height: "60",
    pricePerMeter: "125.00",
    unitType: "Meter",
    reorderLevel: 15,
    hsnCode: "520811",
    gstPercent: "5",
    vendor: "Arvind Mills",
    imageFileName: "cotton-poplin-white.jpg",
  },
  {
    fabricType: "Denim 12oz",
    quality: "Standard",
    color: "Blue",
    hexCode: "#1E3A8A",
    width: "60",
    height: "50",
    pricePerMeter: "180.00",
    unitType: "Meter",
    reorderLevel: 12,
    hsnCode: "520912",
    gstPercent: "12",
    vendor: "Raymond",
    imageFileName: "denim-12oz-blue.jpg",
  },
  {
    fabricType: "Silk Charmeuse",
    quality: "Luxury",
    color: "Red",
    hexCode: "#FF0000",
    width: "44",
    height: "100",
    pricePerMeter: "850.00",
    unitType: "Meter",
    reorderLevel: 8,
    hsnCode: "500720",
    gstPercent: "5",
    vendor: "Sutlej Textiles",
    imageFileName: "silk-charmeuse-red.jpg",
  },
  {
    fabricType: "Linen 60 Lea",
    quality: "Premium",
    color: "Beige",
    hexCode: "#F5F5DC",
    width: "56",
    height: "55",
    pricePerMeter: "220.00",
    unitType: "Meter",
    reorderLevel: 10,
    hsnCode: "530919",
    gstPercent: "5",
    vendor: "Reliance Textiles",
    imageFileName: "linen-60-lea-beige.jpg",
  },
  {
    fabricType: "Polyester Georgette",
    quality: "Standard",
    color: "Black",
    hexCode: "#000000",
    width: "44",
    height: "80",
    pricePerMeter: "95.00",
    unitType: "Meter",
    reorderLevel: 18,
    hsnCode: "540710",
    gstPercent: "18",
    vendor: "Vardhman Textiles",
    imageFileName: "polyester-georgette-black.jpg",
  },
  {
    fabricType: "Wool Tweed",
    quality: "Premium",
    color: "Grey",
    hexCode: "#808080",
    width: "60",
    height: "45",
    pricePerMeter: "450.00",
    unitType: "Meter",
    reorderLevel: 10,
    hsnCode: "511211",
    gstPercent: "12",
    vendor: "Jaya Textiles",
    imageFileName: "wool-tweed-grey.jpg",
  },
  {
    fabricType: "Satin Duchess",
    quality: "Luxury",
    color: "Gold",
    hexCode: "#D4AF37",
    width: "58",
    height: "70",
    pricePerMeter: "380.00",
    unitType: "Meter",
    reorderLevel: 8,
    hsnCode: "540710",
    gstPercent: "18",
    vendor: "Bombay Dyeing",
    imageFileName: "satin-duchess-gold.jpg",
  },
  {
    fabricType: "Cotton Canvas 10oz",
    quality: "Standard",
    color: "White",
    hexCode: "#FFFFFF",
    width: "60",
    height: "50",
    pricePerMeter: "140.00",
    unitType: "Meter",
    reorderLevel: 14,
    hsnCode: "520811",
    gstPercent: "5",
    vendor: "Garden Silk Mills",
    imageFileName: "cotton-canvas-10oz-white.jpg",
  },
  {
    fabricType: "Viscose Rayon Challis",
    quality: "Fine",
    color: "Burgundy",
    hexCode: "#800020",
    width: "56",
    height: "75",
    pricePerMeter: "160.00",
    unitType: "Meter",
    reorderLevel: 12,
    hsnCode: "540710",
    gstPercent: "18",
    vendor: "Trident Group",
    imageFileName: "viscose-rayon-challis-burgundy.jpg",
  },
  {
    fabricType: "Nylon Spandex 4-Way",
    quality: "Standard",
    color: "Black",
    hexCode: "#000000",
    width: "60",
    height: "120",
    pricePerMeter: "210.00",
    unitType: "Meter",
    reorderLevel: 15,
    hsnCode: "540710",
    gstPercent: "18",
    vendor: "Welspun India",
    imageFileName: "nylon-spandex-4way-black.jpg",
  },
];

export async function seedStockAlertsWithNewRecords(): Promise<void> {
  const materialNames = MATERIAL_MASTER.map(m => m.materialName);
  const fabricTypes = FABRIC_MASTER.map(f => f.fabricType);

  // Fetch active warehouses
  const warehouses = await db
    .select({ name: warehouseLocations.name, code: warehouseLocations.code })
    .from(warehouseLocations)
    .where(and(eq(warehouseLocations.isActive, true), eq(warehouseLocations.isDeleted, false)))
    .orderBy(warehouseLocations.id);

  if (warehouses.length === 0) {
    throw new Error("No active warehouses found. Please seed warehouse locations first.");
  }

  const defaultMatWarehouse = warehouses[0]?.name;
  const defaultFabWarehouse = warehouses[1]?.name ?? warehouses[0]?.name;

  console.log(
    `[seedStockAlertsWithNewRecords] Material warehouse: ${defaultMatWarehouse}, Fabric warehouse: ${defaultFabWarehouse}`
  );

  // Get current counts for code generation (matches actual app logic)
  const matCountRes = await db.select({ count: sql`count(*)` }).from(materialsTable);
  const fabCountRes = await db.select({ count: sql`count(*)` }).from(fabricsTable);
  let initialMatCount = Number(matCountRes[0].count);
  let initialFabCount = Number(fabCountRes[0].count);

  console.log(
    `[seedStockAlertsWithNewRecords] Existing materials: ${initialMatCount}, Existing fabrics: ${initialFabCount}`
  );

  await db.transaction(async (tx) => {
    let matCreated = 0;

    // ─── Insert LOW-STOCK Materials ───
    for (const mat of MATERIAL_MASTER) {
      // Duplicate check: matches actual app logic
      const dupMat = await tx
        .select({ id: materialsTable.id })
        .from(materialsTable)
        .where(
          and(
            ilike(materialsTable.type, mat.type),
            ilike(materialsTable.colorName, mat.color),
            eq(materialsTable.size, mat.size),
            eq(materialsTable.isDeleted, false)
          )
        );

      if (dupMat.length > 0) {
        console.warn(`[seedStockAlerts] Material "${mat.materialName}" already exists. Skipping.`);
        continue;
      }

      // Code generation: matches actual app logic
      const materialCode = `MAT${String(initialMatCount + matCreated + 1).padStart(4, "0")}`;
      matCreated++;

      const currentStock = String(mat.currentStock);
      const reorderLevel = String(mat.reorderLevel);
      const minimumLevel = String(Math.floor(mat.reorderLevel * 0.5));
      const maximumLevel = String(mat.reorderLevel * 3);

      const [inserted] = await tx
        .insert(materialsTable)
        .values({
          materialCode,
          materialName: mat.materialName,
          quality: mat.quality,
          type: mat.type,
          color: mat.color,
          hexCode: mat.hexCode,
          colorName: mat.color,
          size: mat.size,
          unitPrice: mat.unitPrice,
          unitType: mat.unitType,
          currentStock,
          locationStocks: [{ location: defaultMatWarehouse, stock: currentStock }],
          hsnCode: mat.hsnCode,
          gstPercent: mat.gstPercent,
          vendor: mat.vendor,
          location: defaultMatWarehouse,
          reorderLevel,
          minimumLevel,
          maximumLevel,
          images: [
            {
              id: `img-${materialCode.toLowerCase()}`,
              name: mat.imageFileName,
              url: `/uploads/materials/images/${mat.imageFileName}`,
              size: 1024,
            },
          ],
          createdBy: "system",
        })
        .returning({ id: materialsTable.id });

      await tx
        .insert(inventoryItemsTable)
        .values({
          sourceType: "material",
          sourceId: inserted.id,
          itemName: mat.materialName,
          itemCode: materialCode,
          category: mat.type,
          department: null,
          warehouseLocation: defaultMatWarehouse,
          unitType: mat.unitType,
          currentStock,
          styleReservedQty: "0",
          swatchReservedQty: "0",
          availableStock: currentStock,
          averagePrice: mat.unitPrice,
          lastPurchasePrice: mat.unitPrice,
          minimumLevel,
          reorderLevel,
          maximumLevel,
          preferredVendor: mat.vendor,
          lastVendor: null,
          images: [
            {
              id: `img-${materialCode.toLowerCase()}`,
              name: mat.imageFileName,
              url: `/uploads/materials/images/${mat.imageFileName}`,
              size: 1024,
            },
          ],
        });

      console.log(`[seedStockAlerts] Low-stock material ${materialCode} created with stock ${currentStock} at ${defaultMatWarehouse}`);
    }

    let fabCreated = 0;

    // ─── Insert OUT-OF-STOCK Fabrics ───
    for (const fab of FABRIC_MASTER) {
      // Duplicate check: matches actual app logic
      const dupFabric = await tx
        .select({ id: fabricsTable.id })
        .from(fabricsTable)
        .where(
          and(
            ilike(fabricsTable.fabricType, fab.fabricType),
            ilike(fabricsTable.quality, fab.quality),
            ilike(fabricsTable.colorName, fab.color),
            eq(fabricsTable.isDeleted, false)
          )
        );

      if (dupFabric.length > 0) {
        console.warn(`[seedStockAlerts] Fabric "${fab.fabricType}" already exists. Skipping.`);
        continue;
      }

      // Code generation: matches actual app logic
      const fabricCode = `FAB${String(initialFabCount + fabCreated + 1).padStart(4, "0")}`;
      fabCreated++;

      const reorderLevel = String(fab.reorderLevel);
      const minimumLevel = String(Math.floor(fab.reorderLevel * 0.5));
      const maximumLevel = String(fab.reorderLevel * 3);

      const [inserted] = await tx
        .insert(fabricsTable)
        .values({
          fabricCode,
          fabricType: fab.fabricType,
          quality: fab.quality,
          color: fab.color,
          hexCode: fab.hexCode,
          colorName: fab.color,
          width: fab.width,
          height: fab.height,
          pricePerMeter: fab.pricePerMeter,
          unitType: fab.unitType,
          currentStock: "0",
          hsnCode: fab.hsnCode,
          gstPercent: fab.gstPercent,
          vendor: fab.vendor,
          location: defaultFabWarehouse,
          locationStocks: [{ location: defaultFabWarehouse, stock: "0" }],
          reorderLevel,
          minimumLevel,
          maximumLevel,
          images: [
            {
              id: `img-${fabricCode.toLowerCase()}`,
              name: fab.imageFileName,
              url: `/uploads/fabrics/images/${fab.imageFileName}`,
              size: 2048,
            },
          ],
          createdBy: "system",
        })
        .returning({ id: fabricsTable.id });

      await tx
        .insert(inventoryItemsTable)
        .values({
          sourceType: "fabric",
          sourceId: inserted.id,
          itemName: `${fab.fabricType} - ${fab.quality} - ${fab.color}`,
          itemCode: fabricCode,
          category: fab.fabricType,
          department: null,
          warehouseLocation: defaultFabWarehouse,
          unitType: fab.unitType,
          currentStock: "0",
          styleReservedQty: "0",
          swatchReservedQty: "0",
          availableStock: "0",
          averagePrice: fab.pricePerMeter,
          lastPurchasePrice: fab.pricePerMeter,
          minimumLevel,
          reorderLevel,
          maximumLevel,
          preferredVendor: fab.vendor,
          lastVendor: null,
          images: [
            {
              id: `img-${fabricCode.toLowerCase()}`,
              name: fab.imageFileName,
              url: `/uploads/fabrics/images/${fab.imageFileName}`,
              size: 2048,
            },
          ],
        });

      console.log(`[seedStockAlerts] Out-of-stock fabric ${fabricCode} created at ${defaultFabWarehouse}.`);
    }
  });

}