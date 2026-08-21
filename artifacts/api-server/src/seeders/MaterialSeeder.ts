import { db, materialsTable, inventoryItemsTable, sql } from "@workspace/db";

interface MaterialSeedData {
  materialName?: string;
  quality: string;
  type: string;
  color: string;
  hexCode: string;
  colorName: string;
  size: string;
  unitPrice: string;
  unitType: string;
  currentStock: string;
  locationStocks: { location: string; stock: string }[];
  hsnCode: string;
  gstPercent: string;
  vendor?: string;
  location?: string;
  reorderLevel?: string;
  minimumLevel?: string;
  maximumLevel?: string;
  images: { id: string; name: string; url: string; size: number }[];
}

export async function seedMaterials(): Promise<void> {
  // Only these warehouses exist (from WarehouseLocationSeeder)
  const warehouses = ["Warehouse A", "Warehouse B", "Warehouse C", "Warehouse D"];

  const materialData: MaterialSeedData[] = [
    // 1. Cotton Fabric
    {
      materialName: "Premium Cotton",
      quality: "Premium",
      type: "Fabric",
      color: "White",
      hexCode: "#FFFFFF",
      colorName: "White",
      size: "58",
      unitPrice: "180.00",
      unitType: "Meter",
      currentStock: "1200",
      locationStocks: [
        { location: "Warehouse A", stock: "800" },
        { location: "Warehouse B", stock: "400" },
      ],
      hsnCode: "520811",
      gstPercent: "5",
      vendor: "Arvind Mills",
      location: "Warehouse A",
      reorderLevel: "200",
      minimumLevel: "100",
      maximumLevel: "2000",
      images: [
        {
          id: "img1",
          name: "cotton-white.jpg",
          url: "/uploads/materials/images/cotton-white.jpg",
          size: 1024,
        },
      ],
    },
    // 2. Denim Fabric
    {
      materialName: "Classic Denim",
      quality: "Standard",
      type: "Fabric",
      color: "Blue",
      hexCode: "#1E3A8A",
      colorName: "Blue",
      size: "60",
      unitPrice: "250.00",
      unitType: "Meter",
      currentStock: "750",
      locationStocks: [
        { location: "Warehouse A", stock: "500" },
        { location: "Warehouse C", stock: "250" },
      ],
      hsnCode: "520912",
      gstPercent: "12",
      vendor: "Raymond",
      location: "Warehouse A",
      reorderLevel: "200",
      minimumLevel: "100",
      maximumLevel: "1500",
      images: [
        {
          id: "img2",
          name: "denim-blue.jpg",
          url: "/uploads/materials/images/denim-blue.jpg",
          size: 2048,
        },
      ],
    },
    // 3. Silk Fabric
    {
      materialName: "Silk",
      quality: "Fine",
      type: "Fabric",
      color: "Red",
      hexCode: "#FF0000",
      colorName: "Red",
      size: "44",
      unitPrice: "450.00",
      unitType: "Meter",
      currentStock: "300",
      locationStocks: [{ location: "Warehouse C", stock: "300" }],
      hsnCode: "540710",
      gstPercent: "18",
      vendor: "Sutlej Textiles",
      location: "Warehouse C",
      reorderLevel: "50",
      minimumLevel: "20",
      maximumLevel: "500",
      images: [
        {
          id: "img3",
          name: "silk-red.jpg",
          url: "/uploads/materials/images/silk-red.jpg",
          size: 1536,
        },
      ],
    },
    // 4. Linen Fabric
    {
      materialName: "Linen",
      quality: "Premium",
      type: "Fabric",
      color: "Beige",
      hexCode: "#F5F5DC",
      colorName: "Beige",
      size: "56",
      unitPrice: "320.00",
      unitType: "Meter",
      currentStock: "600",
      locationStocks: [{ location: "Warehouse D", stock: "600" }],
      hsnCode: "530911",
      gstPercent: "5",
      vendor: "Jaya Textiles",
      location: "Warehouse D",
      reorderLevel: "100",
      minimumLevel: "50",
      maximumLevel: "1000",
      images: [
        {
          id: "img4",
          name: "linen-beige.jpg",
          url: "/uploads/materials/images/linen-beige.jpg",
          size: 1800,
        },
      ],
    },
    // 5. Polyester Fabric
    {
      materialName: "Polyester",
      quality: "Standard",
      type: "Fabric",
      color: "Black",
      hexCode: "#000000",
      colorName: "Black",
      size: "58",
      unitPrice: "140.00",
      unitType: "Meter",
      currentStock: "900",
      locationStocks: [
        { location: "Warehouse A", stock: "700" },
        { location: "Warehouse B", stock: "200" },
      ],
      hsnCode: "540761",
      gstPercent: "12",
      vendor: "Reliance Textiles",
      location: "Warehouse A",
      reorderLevel: "150",
      minimumLevel: "75",
      maximumLevel: "1200",
      images: [
        {
          id: "img5",
          name: "polyester-black.jpg",
          url: "/uploads/materials/images/polyester-black.jpg",
          size: 2200,
        },
      ],
    },
    // 6. Pearl Embellishment
    {
      materialName: "Pearl",
      quality: "Premium",
      type: "Embellishment",
      color: "White",
      hexCode: "#F5F5F0",
      colorName: "Pearl White",
      size: "6",
      unitPrice: "0.00",
      unitType: "Piece",
      currentStock: "5000",
      locationStocks: [{ location: "Warehouse A", stock: "5000" }],
      hsnCode: "580890",
      gstPercent: "5",
      vendor: "Vardhman Textiles",
      location: "Warehouse A",
      reorderLevel: "500",
      minimumLevel: "200",
      maximumLevel: "10000",
      images: [
        {
          id: "img6",
          name: "pearl-white.jpg",
          url: "/uploads/materials/images/pearl-white.jpg",
          size: 1024,
        },
      ],
    },
    // 7. Sewing Thread
    {
      materialName: "Sewing Thread",
      quality: "Standard",
      type: "Trim",
      color: "White",
      hexCode: "#FFFFFF",
      colorName: "White",
      size: "40",
      unitPrice: "0.50",
      unitType: "Meter",
      currentStock: "10000",
      locationStocks: [{ location: "Warehouse B", stock: "10000" }],
      hsnCode: "520420",
      gstPercent: "5",
      vendor: "Nahar Spinning",
      location: "Warehouse B",
      reorderLevel: "1000",
      minimumLevel: "500",
      maximumLevel: "20000",
      images: [
        {
          id: "img7",
          name: "thread-white.jpg",
          url: "/uploads/materials/images/thread-white.jpg",
          size: 512,
        },
      ],
    },
    // 8. Metal Button
    {
      materialName: "Metal Button",
      quality: "Premium",
      type: "Accessory",
      color: "Gold",
      hexCode: "#D4AF37",
      colorName: "Gold",
      size: "18",
      unitPrice: "0.25",
      unitType: "Piece",
      currentStock: "2000",
      locationStocks: [{ location: "Warehouse C", stock: "2000" }],
      hsnCode: "960621",
      gstPercent: "18",
      vendor: "Bombay Dyeing",
      location: "Warehouse C",
      reorderLevel: "200",
      minimumLevel: "100",
      maximumLevel: "5000",
      images: [
        {
          id: "img8",
          name: "button-gold.jpg",
          url: "/uploads/materials/images/button-gold.jpg",
          size: 768,
        },
      ],
    },
    // 9. Designer Lace
    {
      materialName: "Designer Lace",
      quality: "Premium",
      type: "Trim",
      color: "White",
      hexCode: "#FFFFFF",
      colorName: "White",
      size: "2",
      unitPrice: "0.00",
      unitType: "Meter",
      currentStock: "100",
      locationStocks: [{ location: "Warehouse A", stock: "100" }],
      hsnCode: "580421",
      gstPercent: "5",
      vendor: "Garden Silk Mills",
      location: "Warehouse A",
      reorderLevel: "20",
      minimumLevel: "10",
      maximumLevel: "200",
      images: [
        {
          id: "img9",
          name: "lace-white.jpg",
          url: "/uploads/materials/images/lace-white.jpg",
          size: 2048,
        },
      ],
    },
    // 10. Interlining
    {
      materialName: "Interlining",
      quality: "Standard",
      type: "Interlining",
      color: "Black",
      hexCode: "#000000",
      colorName: "Black",
      size: "44",
      unitPrice: "80.00",
      unitType: "Meter",
      currentStock: "400",
      locationStocks: [{ location: "Warehouse B", stock: "400" }],
      hsnCode: "590310",
      gstPercent: "12",
      vendor: "Sutlej Textiles",
      location: "Warehouse B",
      reorderLevel: "50",
      minimumLevel: "25",
      maximumLevel: "800",
      images: [
        {
          id: "img10",
          name: "interlining-black.jpg",
          url: "/uploads/materials/images/interlining-black.jpg",
          size: 1024,
        },
      ],
    },
    // 11. Lining Fabric
    {
      materialName: "Lining",
      quality: "Standard",
      type: "Lining",
      color: "Beige",
      hexCode: "#F5F5DC",
      colorName: "Beige",
      size: "56",
      unitPrice: "120.00",
      unitType: "Meter",
      currentStock: "350",
      locationStocks: [{ location: "Warehouse D", stock: "350" }],
      hsnCode: "540720",
      gstPercent: "12",
      vendor: "Raymond",
      location: "Warehouse D",
      reorderLevel: "40",
      minimumLevel: "20",
      maximumLevel: "600",
      images: [
        {
          id: "img11",
          name: "lining-beige.jpg",
          url: "/uploads/materials/images/lining-beige.jpg",
          size: 1536,
        },
      ],
    },
    // 12. Elastic Band
    {
      materialName: "Elastic Band",
      quality: "Standard",
      type: "Trim",
      color: "Black",
      hexCode: "#000000",
      colorName: "Black",
      size: "2",
      unitPrice: "0.75",
      unitType: "Meter",
      currentStock: "2000",
      locationStocks: [{ location: "Warehouse A", stock: "2000" }],
      hsnCode: "580610",
      gstPercent: "18",
      vendor: "Trident Group",
      location: "Warehouse A",
      reorderLevel: "150",
      minimumLevel: "75",
      maximumLevel: "4000",
      images: [
        {
          id: "img12",
          name: "elastic-black.jpg",
          url: "/uploads/materials/images/elastic-black.jpg",
          size: 512,
        },
      ],
    },
    // 13. Zipper
    {
      materialName: "Zipper",
      quality: "Premium",
      type: "Accessory",
      color: "Silver",
      hexCode: "#C0C0C0",
      colorName: "Silver",
      size: "60",
      unitPrice: "1.50",
      unitType: "Piece",
      currentStock: "1500",
      locationStocks: [{ location: "Warehouse C", stock: "1500" }],
      hsnCode: "960711",
      gstPercent: "18",
      vendor: "Welspun India",
      location: "Warehouse C",
      reorderLevel: "100",
      minimumLevel: "50",
      maximumLevel: "3000",
      images: [
        {
          id: "img13",
          name: "zipper-silver.jpg",
          url: "/uploads/materials/images/zipper-silver.jpg",
          size: 768,
        },
      ],
    },
    // 14. Label
    {
      materialName: "Label",
      quality: "Standard",
      type: "Label",
      color: "White",
      hexCode: "#FFFFFF",
      colorName: "White",
      size: "5",
      unitPrice: "0.10",
      unitType: "Piece",
      currentStock: "5000",
      locationStocks: [{ location: "Warehouse D", stock: "5000" }],
      hsnCode: "580710",
      gstPercent: "5",
      vendor: "Indo Count Industries",
      location: "Warehouse D",
      reorderLevel: "500",
      minimumLevel: "200",
      maximumLevel: "10000",
      images: [
        {
          id: "img14",
          name: "label-white.jpg",
          url: "/uploads/materials/images/label-white.jpg",
          size: 512,
        },
      ],
    },
    // 15. Packaging Box
    {
      materialName: "Corrugated Carton",
      quality: "Standard",
      type: "Packaging",
      color: "Brown",
      hexCode: "#8B4513",
      colorName: "Brown",
      size: "12",
      unitPrice: "2.00",
      unitType: "Piece",
      currentStock: "800",
      locationStocks: [{ location: "Warehouse B", stock: "800" }],
      hsnCode: "481910",
      gstPercent: "18",
      vendor: "Bombay Dyeing",
      location: "Warehouse B",
      reorderLevel: "50",
      minimumLevel: "25",
      maximumLevel: "1500",
      images: [
        {
          id: "img15",
          name: "carton-brown.jpg",
          url: "/uploads/materials/images/carton-brown.jpg",
          size: 1024,
        },
      ],
    },
  ];

  let materialCounter = 1;

  await db.transaction(async (tx) => {
    for (const data of materialData) {
      // Generate materialCode (MAT001, MAT002, ...)
      const materialCode = `MAT${String(materialCounter).padStart(4, "0")}`;
      materialCounter++;

      // Insert material
      const [insertedMaterial] = await tx
        .insert(materialsTable)
        .values({
          materialCode,
          materialName: data.materialName || null,
          quality: data.quality,
          type: data.type,
          color: data.color,
          hexCode: data.hexCode,
          colorName: data.colorName,
          size: data.size,
          unitPrice: data.unitPrice,
          unitType: data.unitType,
          currentStock: data.currentStock,
          locationStocks: data.locationStocks,
          hsnCode: data.hsnCode,
          gstPercent: data.gstPercent,
          vendor: data.vendor || null,
          location: data.location || null,
          images: data.images,
          reorderLevel: data.reorderLevel ? parseFloat(data.reorderLevel) : null,
          minimumLevel: data.minimumLevel ? parseFloat(data.minimumLevel) : null,
          maximumLevel: data.maximumLevel ? parseFloat(data.maximumLevel) : null,
          createdBy: "system",
        } as any)
        .onConflictDoNothing()
        .returning({ id: materialsTable.id, materialCode: materialsTable.materialCode });

      if (!insertedMaterial) {
        // If material already exists, fetch its id and update inventory
        const existing = await tx
          .select({ id: materialsTable.id })
          .from(materialsTable)
          .where(sql`${materialsTable.materialCode} = ${materialCode}`)
          .limit(1);
        if (existing.length > 0) {
          const sourceId = existing[0].id;
          await upsertInventoryItem(tx, sourceId, data, materialCode);
        }
        continue;
      }

      const sourceId = insertedMaterial.id;

      // Insert/update inventory item
      await upsertInventoryItem(tx, sourceId, data, materialCode);
    }
  });

  console.log(`[master-seed] Materials: ${materialData.length} materials processed with inventory items`);
}

/**
 * Helper to upsert inventory item using Drizzle's onConflictDoUpdate.
 */
async function upsertInventoryItem(
  tx: any, // transaction object
  sourceId: number,
  data: MaterialSeedData,
  materialCode: string
): Promise<void> {
  const currentStock = parseFloat(data.currentStock) || 0;
  const avgPrice = parseFloat(data.unitPrice) || 0;
  const reorderLevel = data.reorderLevel ? parseFloat(data.reorderLevel) : 0;
  const minimumLevel = data.minimumLevel ? parseFloat(data.minimumLevel) : 0;
  const maximumLevel = data.maximumLevel ? parseFloat(data.maximumLevel) : 0;

  const itemName = data.materialName || `${data.type} - ${data.quality} - ${data.colorName}`;

  await tx
    .insert(inventoryItemsTable)
    .values({
      sourceType: "material",
      sourceId: sourceId,
      itemName: itemName,
      itemCode: materialCode,
      category: data.type,
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