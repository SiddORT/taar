import { db, fabricsTable, inventoryItemsTable, sql } from "@workspace/db";

interface FabricSeedData {
  fabricType: string;
  quality: string;
  color: string;
  hexCode: string;
  colorName: string;
  width: string;
  height?: string;
  pricePerMeter: string;
  unitType: string;
  currentStock: string;
  hsnCode: string;         // must match HSN seeder (e.g., "520811")
  gstPercent: string;      // must match the HSN's percentage
  vendor: string;
  location: string;        // single warehouse
  locationStocks: { location: string; stock: string }[];
  reorderLevel?: string;
  minimumLevel?: string;
  maximumLevel?: string;
  images: { id: string; name: string; url: string; size: number }[];
}

export async function seedFabrics(): Promise<void> {
  // Only these warehouses exist (from WarehouseLocationSeeder)
  const warehouses = ["Warehouse A", "Warehouse B", "Warehouse C", "Warehouse D"];

  const fabricData: FabricSeedData[] = [
    // 1. Cotton – Premium White
    {
      fabricType: "Cotton",
      quality: "Premium",
      color: "White",
      hexCode: "#FFFFFF",
      colorName: "White",
      width: "58",
      height: "100",
      pricePerMeter: "180.00",
      unitType: "Meter",
      currentStock: "1200",
      hsnCode: "520811",
      gstPercent: "5",
      vendor: "Arvind Mills",
      location: "Warehouse A",
      locationStocks: [
        { location: "Warehouse A", stock: "800" },
        { location: "Warehouse B", stock: "400" },
      ],
      reorderLevel: "200",
      minimumLevel: "100",
      maximumLevel: "2000",
      images: [
        {
          id: "fab-img-1",
          name: "cotton-white.jpg",
          url: "/uploads/fabrics/images/cotton-white.jpg",
          size: 1024,
        },
      ],
    },
    // 2. Denim – Standard Blue
    {
      fabricType: "Denim",
      quality: "Standard",
      color: "Blue",
      hexCode: "#1E3A8A",
      colorName: "Blue",
      width: "60",
      height: "120",
      pricePerMeter: "250.00",
      unitType: "Meter",
      currentStock: "750",
      hsnCode: "520912",
      gstPercent: "12",
      vendor: "Raymond",
      location: "Warehouse A",
      locationStocks: [
        { location: "Warehouse A", stock: "500" },
        { location: "Warehouse C", stock: "250" },
      ],
      reorderLevel: "200",
      minimumLevel: "100",
      maximumLevel: "1500",
      images: [
        {
          id: "fab-img-2",
          name: "denim-blue.jpg",
          url: "/uploads/fabrics/images/denim-blue.jpg",
          size: 2048,
        },
      ],
    },
    // 3. Silk – Fine Red
    {
      fabricType: "Silk",
      quality: "Fine",
      color: "Red",
      hexCode: "#FF0000",
      colorName: "Red",
      width: "44",
      height: "50",
      pricePerMeter: "450.00",
      unitType: "Meter",
      currentStock: "300",
      hsnCode: "540710",
      gstPercent: "18",
      vendor: "Sutlej Textiles",
      location: "Warehouse C",
      locationStocks: [{ location: "Warehouse C", stock: "300" }],
      reorderLevel: "50",
      minimumLevel: "20",
      maximumLevel: "500",
      images: [
        {
          id: "fab-img-3",
          name: "silk-red.jpg",
          url: "/uploads/fabrics/images/silk-red.jpg",
          size: 1536,
        },
      ],
    },
    // 4. Linen – Premium Beige
    {
      fabricType: "Linen",
      quality: "Premium",
      color: "Beige",
      hexCode: "#F5F5DC",
      colorName: "Beige",
      width: "56",
      height: "100",
      pricePerMeter: "320.00",
      unitType: "Meter",
      currentStock: "600",
      hsnCode: "551311",
      gstPercent: "5",
      vendor: "Jaya Textiles",
      location: "Warehouse D",
      locationStocks: [{ location: "Warehouse D", stock: "600" }],
      reorderLevel: "100",
      minimumLevel: "50",
      maximumLevel: "1000",
      images: [
        {
          id: "fab-img-4",
          name: "linen-beige.jpg",
          url: "/uploads/fabrics/images/linen-beige.jpg",
          size: 1800,
        },
      ],
    },
    // 5. Polyester – Standard Black
    {
      fabricType: "Polyester",
      quality: "Standard",
      color: "Black",
      hexCode: "#000000",
      colorName: "Black",
      width: "58",
      height: "90",
      pricePerMeter: "140.00",
      unitType: "Meter",
      currentStock: "900",
      hsnCode: "540710",
      gstPercent: "18",
      vendor: "Reliance Textiles",
      location: "Warehouse A",
      locationStocks: [
        { location: "Warehouse A", stock: "700" },
        { location: "Warehouse B", stock: "200" },
      ],
      reorderLevel: "150",
      minimumLevel: "75",
      maximumLevel: "1200",
      images: [
        {
          id: "fab-img-5",
          name: "polyester-black.jpg",
          url: "/uploads/fabrics/images/polyester-black.jpg",
          size: 2200,
        },
      ],
    },
    // 6. Wool – Premium Grey
    {
      fabricType: "Wool",
      quality: "Premium",
      color: "Grey",
      hexCode: "#808080",
      colorName: "Grey",
      width: "60",
      height: "110",
      pricePerMeter: "380.00",
      unitType: "Meter",
      currentStock: "400",
      hsnCode: "620342",
      gstPercent: "12",
      vendor: "Raymond",
      location: "Warehouse B",
      locationStocks: [{ location: "Warehouse B", stock: "400" }],
      reorderLevel: "80",
      minimumLevel: "40",
      maximumLevel: "800",
      images: [
        {
          id: "fab-img-6",
          name: "wool-grey.jpg",
          url: "/uploads/fabrics/images/wool-grey.jpg",
          size: 1600,
        },
      ],
    },
    // 7. Satin – Standard Pink
    {
      fabricType: "Satin",
      quality: "Standard",
      color: "Pink",
      hexCode: "#FFC0CB",
      colorName: "Pink",
      width: "54",
      height: "80",
      pricePerMeter: "220.00",
      unitType: "Meter",
      currentStock: "500",
      hsnCode: "540710",
      gstPercent: "18",
      vendor: "Sutlej Textiles",
      location: "Warehouse C",
      locationStocks: [{ location: "Warehouse C", stock: "500" }],
      reorderLevel: "100",
      minimumLevel: "50",
      maximumLevel: "1000",
      images: [
        {
          id: "fab-img-7",
          name: "satin-pink.jpg",
          url: "/uploads/fabrics/images/satin-pink.jpg",
          size: 1400,
        },
      ],
    },
    // 8. Canvas – Premium Natural
    {
      fabricType: "Canvas",
      quality: "Premium",
      color: "Natural",
      hexCode: "#F5DEB3",
      colorName: "Natural",
      width: "62",
      height: "95",
      pricePerMeter: "280.00",
      unitType: "Meter",
      currentStock: "350",
      hsnCode: "520811",
      gstPercent: "5",
      vendor: "Arvind Mills",
      location: "Warehouse D",
      locationStocks: [{ location: "Warehouse D", stock: "350" }],
      reorderLevel: "70",
      minimumLevel: "35",
      maximumLevel: "700",
      images: [
        {
          id: "fab-img-8",
          name: "canvas-natural.jpg",
          url: "/uploads/fabrics/images/canvas-natural.jpg",
          size: 1900,
        },
      ],
    },
    // 9. Viscose – Standard Burgundy
    {
      fabricType: "Viscose",
      quality: "Standard",
      color: "Burgundy",
      hexCode: "#800020",
      colorName: "Burgundy",
      width: "56",
      height: "85",
      pricePerMeter: "190.00",
      unitType: "Meter",
      currentStock: "600",
      hsnCode: "551311",
      gstPercent: "5",
      vendor: "Indo Count Industries",
      location: "Warehouse A",
      locationStocks: [{ location: "Warehouse A", stock: "600" }],
      reorderLevel: "120",
      minimumLevel: "60",
      maximumLevel: "1200",
      images: [
        {
          id: "fab-img-9",
          name: "viscose-burgundy.jpg",
          url: "/uploads/fabrics/images/viscose-burgundy.jpg",
          size: 1700,
        },
      ],
    },
    // 10. Tweed – Premium Charcoal
    {
      fabricType: "Tweed",
      quality: "Premium",
      color: "Charcoal",
      hexCode: "#36454F",
      colorName: "Charcoal",
      width: "58",
      height: "100",
      pricePerMeter: "420.00",
      unitType: "Meter",
      currentStock: "200",
      hsnCode: "620342",
      gstPercent: "12",
      vendor: "Raymond",
      location: "Warehouse B",
      locationStocks: [{ location: "Warehouse B", stock: "200" }],
      reorderLevel: "40",
      minimumLevel: "20",
      maximumLevel: "400",
      images: [
        {
          id: "fab-img-10",
          name: "tweed-charcoal.jpg",
          url: "/uploads/fabrics/images/tweed-charcoal.jpg",
          size: 2100,
        },
      ],
    },
    // 11. Chiffon – Standard Peach
    {
      fabricType: "Chiffon",
      quality: "Standard",
      color: "Peach",
      hexCode: "#FFDAB9",
      colorName: "Peach",
      width: "48",
      height: "75",
      pricePerMeter: "160.00",
      unitType: "Meter",
      currentStock: "800",
      hsnCode: "540710",
      gstPercent: "18",
      vendor: "Sutlej Textiles",
      location: "Warehouse C",
      locationStocks: [{ location: "Warehouse C", stock: "800" }],
      reorderLevel: "150",
      minimumLevel: "75",
      maximumLevel: "1500",
      images: [
        {
          id: "fab-img-11",
          name: "chiffon-peach.jpg",
          url: "/uploads/fabrics/images/chiffon-peach.jpg",
          size: 1200,
        },
      ],
    },
    // 12. Jacquard – Premium Gold
    {
      fabricType: "Jacquard",
      quality: "Premium",
      color: "Gold",
      hexCode: "#FFD700",
      colorName: "Gold",
      width: "54",
      height: "95",
      pricePerMeter: "500.00",
      unitType: "Meter",
      currentStock: "150",
      hsnCode: "540710",
      gstPercent: "18",
      vendor: "Welspun India",
      location: "Warehouse D",
      locationStocks: [{ location: "Warehouse D", stock: "150" }],
      reorderLevel: "30",
      minimumLevel: "15",
      maximumLevel: "300",
      images: [
        {
          id: "fab-img-12",
          name: "jacquard-gold.jpg",
          url: "/uploads/fabrics/images/jacquard-gold.jpg",
          size: 2300,
        },
      ],
    },
    // 13. Nylon – Standard Olive
    {
      fabricType: "Nylon",
      quality: "Standard",
      color: "Olive",
      hexCode: "#556B2F",
      colorName: "Olive",
      width: "60",
      height: "85",
      pricePerMeter: "110.00",
      unitType: "Meter",
      currentStock: "1000",
      hsnCode: "540710",
      gstPercent: "18",
      vendor: "Reliance Textiles",
      location: "Warehouse A",
      locationStocks: [{ location: "Warehouse A", stock: "1000" }],
      reorderLevel: "200",
      minimumLevel: "100",
      maximumLevel: "2000",
      images: [
        {
          id: "fab-img-13",
          name: "nylon-olive.jpg",
          url: "/uploads/fabrics/images/nylon-olive.jpg",
          size: 1300,
        },
      ],
    },
    // 14. Lace – Premium Cream
    {
      fabricType: "Lace",
      quality: "Premium",
      color: "Cream",
      hexCode: "#FFFDD0",
      colorName: "Cream",
      width: "48",
      height: "70",
      pricePerMeter: "340.00",
      unitType: "Meter",
      currentStock: "250",
      hsnCode: "520811",
      gstPercent: "5",
      vendor: "Garden Silk Mills",
      location: "Warehouse B",
      locationStocks: [{ location: "Warehouse B", stock: "250" }],
      reorderLevel: "50",
      minimumLevel: "25",
      maximumLevel: "500",
      images: [
        {
          id: "fab-img-14",
          name: "lace-cream.jpg",
          url: "/uploads/fabrics/images/lace-cream.jpg",
          size: 1850,
        },
      ],
    },
    // 15. Fleece – Standard Navy
    {
      fabricType: "Fleece",
      quality: "Standard",
      color: "Navy",
      hexCode: "#000080",
      colorName: "Navy",
      width: "58",
      height: "90",
      pricePerMeter: "260.00",
      unitType: "Meter",
      currentStock: "500",
      hsnCode: "520912",
      gstPercent: "12",
      vendor: "Trident Group",
      location: "Warehouse C",
      locationStocks: [{ location: "Warehouse C", stock: "500" }],
      reorderLevel: "100",
      minimumLevel: "50",
      maximumLevel: "1000",
      images: [
        {
          id: "fab-img-15",
          name: "fleece-navy.jpg",
          url: "/uploads/fabrics/images/fleece-navy.jpg",
          size: 1600,
        },
      ],
    },
  ];

  let fabricCounter = 1;

  await db.transaction(async (tx) => {
    for (const data of fabricData) {
      const fabricCode = `FAB${String(fabricCounter).padStart(4, "0")}`;
      fabricCounter++;

      // Build insert object with type assertion
      const insertValues = {
        fabricCode,
        fabricType: data.fabricType,
        quality: data.quality,
        color: data.color,
        hexCode: data.hexCode,
        colorName: data.colorName,
        width: data.width,
        height: data.height || null,
        pricePerMeter: data.pricePerMeter,
        unitType: data.unitType,
        currentStock: data.currentStock,
        hsnCode: data.hsnCode,
        gstPercent: data.gstPercent,
        vendor: data.vendor,
        location: data.location,
        locationStocks: data.locationStocks,
        images: data.images,
        reorderLevel: data.reorderLevel,
        minimumLevel: data.minimumLevel,
        maximumLevel: data.maximumLevel,
        createdBy: "system",
      } satisfies typeof fabricsTable.$inferInsert;

      const [insertedFabric] = await tx
        .insert(fabricsTable)
        .values(insertValues)
        .onConflictDoNothing()
        .returning({ id: fabricsTable.id, fabricCode: fabricsTable.fabricCode });

      if (!insertedFabric) {
        // If fabric already exists, fetch its id and update inventory
        const existing = await tx
          .select({ id: fabricsTable.id })
          .from(fabricsTable)
          .where(sql`${fabricsTable.fabricCode} = ${fabricCode}`)
          .limit(1);
        if (existing.length > 0) {
          const sourceId = existing[0].id;
          await upsertInventoryItem(tx, sourceId, data, fabricCode);
        }
        continue;
      }

      const sourceId = insertedFabric.id;
      await upsertInventoryItem(tx, sourceId, data, fabricCode);
    }
  });

  console.log(`[master-seed] Fabrics: ${fabricData.length} fabrics processed with inventory items`);
}

/**
 * Helper to upsert inventory item using Drizzle's onConflictDoUpdate.
 */
async function upsertInventoryItem(
  tx: any,
  sourceId: number,
  data: FabricSeedData,
  fabricCode: string
): Promise<void> {
  const currentStock = parseFloat(data.currentStock) || 0;
  const avgPrice = parseFloat(data.pricePerMeter) || 0;
  const reorderLevel = data.reorderLevel ? parseFloat(data.reorderLevel) : 0;
  const minimumLevel = data.minimumLevel ? parseFloat(data.minimumLevel) : 0;
  const maximumLevel = data.maximumLevel ? parseFloat(data.maximumLevel) : 0;

  // itemName = fabricType - quality - colorName (matches API logic)
  const itemName = `${data.fabricType} - ${data.quality} - ${data.colorName}`;

  await tx
    .insert(inventoryItemsTable)
    .values({
      sourceType: "fabric",
      sourceId: sourceId,
      itemName: itemName,
      itemCode: fabricCode,
      category: data.fabricType,
      department: null,
      warehouseLocation: data.location || null,
      unitType: data.unitType,
      currentStock: currentStock.toString(),
      styleReservedQty: "0",
      swatchReservedQty: "0",
      availableStock: currentStock.toString(),
      averagePrice: avgPrice.toString(),
      lastPurchasePrice: avgPrice.toString(),
      minimumLevel: minimumLevel.toString(),
      reorderLevel: reorderLevel.toString(),
      maximumLevel: maximumLevel.toString(),
      preferredVendor: data.vendor || null,
      lastVendor: null,
      images: data.images,
    })
    .onConflictDoUpdate({
      target: [inventoryItemsTable.sourceType, inventoryItemsTable.sourceId],
      set: {
        itemName: sql`excluded.item_name`,
        itemCode: sql`excluded.item_code`,
        category: sql`excluded.category`,
        department: sql`excluded.department`,
        warehouseLocation: sql`excluded.warehouse_location`,
        unitType: sql`excluded.unit_type`,
        currentStock: sql`excluded.current_stock`,
        styleReservedQty: sql`excluded.style_reserved_qty`,
        swatchReservedQty: sql`excluded.swatch_reserved_qty`,
        availableStock: sql`excluded.available_stock`,
        averagePrice: sql`excluded.average_price`,
        lastPurchasePrice: sql`excluded.last_purchase_price`,
        minimumLevel: sql`excluded.minimum_level`,
        reorderLevel: sql`excluded.reorder_level`,
        maximumLevel: sql`excluded.maximum_level`,
        preferredVendor: sql`excluded.preferred_vendor`,
        lastVendor: sql`excluded.last_vendor`,
        images: sql`excluded.images`,
        lastUpdatedAt: sql`now()`,
      },
    });
}