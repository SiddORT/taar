import {
  db,
  eq,
  and,
  itemTypesTable,
  unitTypesTable,
  departmentsTable,
  swatchCategoriesTable,
  hsnTable,
  materialsTable,
  clientsTable,
  vendorsTable,
  styleCategoriesTable,
  swatchesTable,
  fabricsTable,
  stylesTable,
  itemsTable,
  warehouseLocations,
  shippingVendors
} from "@workspace/db";
import { sql } from "drizzle-orm";

// --------------------- Existing seed functions (unchanged) ---------------------

async function seedItemTypes(): Promise<void> {
  const result = await db
    .insert(itemTypesTable)
    .values([
      { name: "Fabric" },
      { name: "Trim" },
      { name: "Accessory" },
      { name: "Packaging" },
      { name: "Label" },
      { name: "Embellishment" },
      { name: "Thread" },
      { name: "Lining" },
      { name: "Interlining" },
    ])
    .onConflictDoNothing()
    .returning({ id: itemTypesTable.id });

  console.log(`[master-seed] Item types: ${result.length} inserted`);
}

async function seedUnitTypes(): Promise<void> {
  const result = await db
    .insert(unitTypesTable)
    .values([
      { name: "Piece" },
      { name: "Meter" },
      { name: "Centimeter" },
      { name: "Millimeter" },
      { name: "Kilogram" },
      { name: "Gram" },
      { name: "Set" },
      { name: "Roll" },
      { name: "Box" },
      { name: "Pair" },
      { name: "Dozen" },
    ])
    .onConflictDoNothing()
    .returning({ id: unitTypesTable.id });

  console.log(`[master-seed] Unit types: ${result.length} inserted`);
}

async function seedDepartments(): Promise<void> {
  const result = await db
    .insert(departmentsTable)
    .values([
      { name: "Design" },
      { name: "Merchandising" },
      { name: "Sampling" },
      { name: "Production" },
      { name: "Quality Control" },
      { name: "Stores" },
      { name: "Purchase" },
      { name: "Sales" },
      { name: "Accounts" },
      { name: "Dispatch" },
    ])
    .onConflictDoNothing()
    .returning({ id: departmentsTable.id });

  console.log(`[master-seed] Departments: ${result.length} inserted`);
}

async function seedSwatchCategories(): Promise<void> {
  const result = await db
    .insert(swatchCategoriesTable)
    .values([
      { name: "Fabric" },
      { name: "Trim" },
      { name: "Accessory" },
      { name: "Embellishment" },
      { name: "Color" },
      { name: "Print" },
    ])
    .onConflictDoNothing()
    .returning({ id: swatchCategoriesTable.id });

  console.log(`[master-seed] Swatch categories: ${result.length} inserted`);
}

// --------------------- Warehouse must be seeded before any dependent data ---------------------

async function seedWarehouseLocations(): Promise<void> {
  const warehouseData = [
    {
      name: "Warehouse A",
      code: "WH001",
      addressLine1: "123 Industrial Area",
      addressLine2: "Andheri East",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400069",
      country: "India",
      contactName: "Rajesh Kumar",
      contactPhone: "9876543201",
      contactEmail: "warehouse.a@example.com",
      isActive: true,
      notes: "Main raw material warehouse",
      createdBy: "system",
    },
    {
      name: "Warehouse B",
      code: "WH002",
      addressLine1: "45 Textile Market",
      addressLine2: "Peenya Industrial Area",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560058",
      country: "India",
      contactName: "Suresh Kumar",
      contactPhone: "9876543202",
      contactEmail: "warehouse.b@example.com",
      isActive: true,
      notes: "Fabric and finished goods warehouse",
      createdBy: "system",
    },
    {
      name: "Warehouse C",
      code: "WH003",
      addressLine1: "78 Industrial Estate",
      addressLine2: "Okhla Phase 2",
      city: "Delhi",
      state: "Delhi",
      pincode: "110020",
      country: "India",
      contactName: "Amit Sharma",
      contactPhone: "9876543203",
      contactEmail: "warehouse.c@example.com",
      isActive: true,
      notes: "Accessories warehouse",
      createdBy: "system",
    },
    {
      name: "Warehouse D",
      code: "WH004",
      addressLine1: "25 Textile Park",
      addressLine2: "Sitapura Industrial Area",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302022",
      country: "India",
      contactName: "Vikas Singh",
      contactPhone: "9876543204",
      contactEmail: "warehouse.d@example.com",
      isActive: true,
      notes: "Finished goods warehouse",
      createdBy: "system",
    },
  ];

  let inserted = 0;
  let updated = 0;

  await db.transaction(async (tx) => {
    for (const item of warehouseData) {
      const existing = await tx
        .select({
          id: warehouseLocations.id,
        })
        .from(warehouseLocations)
        .where(
          and(
            eq(warehouseLocations.code, item.code),
            eq(warehouseLocations.isDeleted, false),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        await tx
          .update(warehouseLocations)
          .set({
            name: item.name,
            addressLine1: item.addressLine1,
            addressLine2: item.addressLine2,
            city: item.city,
            state: item.state,
            pincode: item.pincode,
            country: item.country,
            contactName: item.contactName,
            contactPhone: item.contactPhone,
            contactEmail: item.contactEmail,
            isActive: item.isActive,
            notes: item.notes,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(warehouseLocations.id, existing[0].id));

        updated++;
      } else {
        await tx.insert(warehouseLocations).values(item);
        inserted++;
      }
    }
  });

  console.log(
    `[master-seed] Warehouse locations: ${inserted} inserted, ${updated} updated`,
  );
}

// --------------------- New seed functions for other masters ---------------------

/**
 * HSN Master – all not-null fields: hsnCode, gstPercentage, createdBy
 */
async function seedHsn(): Promise<void> {
  const hsnData = [
    {
      hsnCode: "520811",
      gstPercentage: "5",
      govtDescription: "Cotton fabrics, plain weave",
      createdBy: "system",
    },
    {
      hsnCode: "520912",
      gstPercentage: "12",
      govtDescription: "Cotton fabrics, denim",
      createdBy: "system",
    },
    {
      hsnCode: "540710",
      gstPercentage: "18",
      govtDescription: "Woven fabrics of synthetic filament yarn",
      createdBy: "system",
    },
    {
      hsnCode: "551311",
      gstPercentage: "5",
      govtDescription: "Woven fabrics of synthetic staple fibres",
      createdBy: "system",
    },
    {
      hsnCode: "620342",
      gstPercentage: "12",
      govtDescription: "Men's trousers of cotton",
      createdBy: "system",
    },
  ];

  await db.transaction(async (tx) => {
    for (const item of hsnData) {
      const existing = await tx
        .select({ id: hsnTable.id })
        .from(hsnTable)
        .where(
          and(
            eq(hsnTable.hsnCode, item.hsnCode),
            eq(hsnTable.isDeleted, false),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        await tx
          .update(hsnTable)
          .set({
            gstPercentage: item.gstPercentage,
            govtDescription: item.govtDescription,
            updatedBy: item.createdBy,
            updatedAt: new Date(),
          })
          .where(eq(hsnTable.id, existing[0].id));
      } else {
        await tx.insert(hsnTable).values(item);
      }
    }
  });

  console.log("[master-seed] HSN codes seeded successfully");
}

/**
 * Materials – required fields:
 * materialCode, quality, colorName, size, unitPrice, unitType, currentStock,
 * hsnCode, gstPercent, createdBy
 *
 * NOTE: On conflict we update all fields EXCEPT `images` to preserve user-uploaded images.
 */
// async function seedMaterials(): Promise<void> {
//   const materialData = [
//     {
//       materialCode: "MAT001",
//       materialName: "Pearl",
//       quality: "Premium",
//       type: "Embellishment",
//       color: "White",
//       hexCode: "#F5F5F0",
//       colorName: "Pearl White",
//       size: "6mm",
//       unitPrice: "0.00",
//       unitType: "Piece",
//       currentStock: "0",
//       locationStocks: [],
//       hsnCode: "",
//       gstPercent: "5",
//       vendor: "",
//       location: "",
//       images: [],
//       reorderLevel: "0",
//       minimumLevel: "0",
//       maximumLevel: "0",
//       createdBy: "system",
//     },
//     {
//       materialCode: "MAT002",
//       materialName: "Sewing Thread",
//       quality: "Standard",
//       type: "Trim",
//       color: "White",
//       hexCode: "#FFFFFF",
//       colorName: "White",
//       size: "40s",
//       unitPrice: "0.00",
//       unitType: "Meter",
//       currentStock: "0",
//       locationStocks: [],
//       hsnCode: "",
//       gstPercent: "5",
//       vendor: "",
//       location: "",
//       images: [],
//       reorderLevel: "0",
//       minimumLevel: "0",
//       maximumLevel: "0",
//       createdBy: "system",
//     },
//     {
//       materialCode: "MAT003",
//       materialName: "Metal Button",
//       quality: "Premium",
//       type: "Accessory",
//       color: "Gold",
//       hexCode: "#D4AF37",
//       colorName: "Gold",
//       size: "18mm",
//       unitPrice: "0.00",
//       unitType: "Piece",
//       currentStock: "0",
//       locationStocks: [],
//       hsnCode: "",
//       gstPercent: "5",
//       vendor: "",
//       location: "",
//       images: [],
//       reorderLevel: "0",
//       minimumLevel: "0",
//       maximumLevel: "0",
//       createdBy: "system",
//     },
//     {
//       materialCode: "MAT004",
//       materialName: "Designer Lace",
//       quality: "Premium",
//       type: "Trim",
//       color: "White",
//       hexCode: "#FFFFFF",
//       colorName: "White",
//       size: "2 inch",
//       unitPrice: "0.00",
//       unitType: "Meter",
//       currentStock: "0",
//       locationStocks: [],
//       hsnCode: "",
//       gstPercent: "5",
//       vendor: "",
//       location: "",
//       images: [],
//       reorderLevel: "0",
//       minimumLevel: "0",
//       maximumLevel: "0",
//       createdBy: "system",
//     },
//   ];

//   const result = await db
//     .insert(materialsTable)
//     .values(materialData)
//     .onConflictDoNothing()
//     .returning({ id: materialsTable.id });

//   console.log(`[master-seed] Materials: ${result.length} inserted`);
// }

/**
 * Fabrics – required fields: fabricCode, fabricType, quality, colorName,
 * pricePerMeter, unitType, currentStock, hsnCode, gstPercent, createdBy
 *
 * NOTE: On conflict we update all fields EXCEPT `images` to preserve user-uploaded images.
 */
// async function seedFabrics(): Promise<void> {
//   const fabricData = [
//     {
//       fabricCode: "FAB001",
//       fabricType: "Cotton",
//       quality: "Premium",
//       color: "White",
//       hexCode: "#FFFFFF",
//       colorName: "White",
//       width: "58",
//       height: "100",
//       pricePerMeter: "180.00",
//       unitType: "Meter",
//       currentStock: "1200",
//       hsnCode: "5208.11",
//       gstPercent: "5",
//       vendor: "Arvind Mills",
//       location: "Mumbai",
//       locationStocks: [
//         { location: "Warehouse A", stock: "800" },
//         { location: "Warehouse B", stock: "400" },
//       ],
//       images: [
//         {
//           id: "fab-img-1",
//           name: "cotton-white.jpg",
//           url: "https://example.com/cotton-white.jpg",
//           size: 1024,
//         },
//       ],
//       reorderLevel: "200",
//       minimumLevel: "100",
//       maximumLevel: "2000",
//       createdBy: "system",
//     },
//     {
//       fabricCode: "FAB002",
//       fabricType: "Denim",
//       quality: "Standard",
//       color: "Blue",
//       hexCode: "#0000FF",
//       colorName: "Blue",
//       width: "60",
//       height: "120",
//       pricePerMeter: "250.00",
//       unitType: "Meter",
//       currentStock: "750",
//       hsnCode: "5209.12",
//       gstPercent: "12",
//       vendor: "Raymond",
//       location: "Bangalore",
//       locationStocks: [
//         { location: "Warehouse A", stock: "500" },
//         { location: "Warehouse C", stock: "250" },
//       ],
//       images: [
//         {
//           id: "fab-img-2",
//           name: "denim-blue.jpg",
//           url: "https://example.com/denim-blue.jpg",
//           size: 2048,
//         },
//       ],
//       reorderLevel: "200",
//       minimumLevel: "100",
//       maximumLevel: "1500",
//       createdBy: "system",
//     },
//     {
//       fabricCode: "FAB003",
//       fabricType: "Silk",
//       quality: "Fine",
//       color: "Red",
//       hexCode: "#FF0000",
//       colorName: "Red",
//       width: "44",
//       height: "50",
//       pricePerMeter: "450.00",
//       unitType: "Meter",
//       currentStock: "300",
//       hsnCode: "5407.10",
//       gstPercent: "18",
//       vendor: "Sutlej Textiles",
//       location: "Delhi",
//       locationStocks: [{ location: "Warehouse C", stock: "300" }],
//       images: [
//         {
//           id: "fab-img-3",
//           name: "silk-red.jpg",
//           url: "https://example.com/silk-red.jpg",
//           size: 1536,
//         },
//       ],
//       reorderLevel: "50",
//       minimumLevel: "20",
//       maximumLevel: "500",
//       createdBy: "system",
//     },
//     {
//       fabricCode: "FAB004",
//       fabricType: "Linen",
//       quality: "Premium",
//       color: "Beige",
//       hexCode: "#F5F5DC",
//       colorName: "Beige",
//       width: "56",
//       height: "100",
//       pricePerMeter: "320.00",
//       unitType: "Meter",
//       currentStock: "600",
//       hsnCode: "5309.11",
//       gstPercent: "5",
//       vendor: "Jaya Textiles",
//       location: "Chennai",
//       locationStocks: [{ location: "Warehouse D", stock: "600" }],
//       images: [
//         {
//           id: "fab-img-4",
//           name: "linen-beige.jpg",
//           url: "https://example.com/linen-beige.jpg",
//           size: 1800,
//         },
//       ],
//       reorderLevel: "100",
//       minimumLevel: "50",
//       maximumLevel: "1000",
//       createdBy: "system",
//     },
//     {
//       fabricCode: "FAB005",
//       fabricType: "Polyester",
//       quality: "Standard",
//       color: "Black",
//       hexCode: "#000000",
//       colorName: "Black",
//       width: "58",
//       height: "90",
//       pricePerMeter: "140.00",
//       unitType: "Meter",
//       currentStock: "900",
//       hsnCode: "5407.61",
//       gstPercent: "12",
//       vendor: "Reliance Textiles",
//       location: "Ahmedabad",
//       locationStocks: [
//         { location: "Warehouse E", stock: "700" },
//         { location: "Warehouse F", stock: "200" },
//       ],
//       images: [
//         {
//           id: "fab-img-5",
//           name: "polyester-black.jpg",
//           url: "https://example.com/polyester-black.jpg",
//           size: 2200,
//         },
//       ],
//       reorderLevel: "150",
//       minimumLevel: "75",
//       maximumLevel: "1200",
//       createdBy: "system",
//     },
//   ];

//   const result = await db
//     .insert(fabricsTable)
//     .values(fabricData)
//     .onConflictDoUpdate({
//       target: fabricsTable.fabricCode,
//       set: {
//         fabricType: sql`excluded.fabric_type`,
//         quality: sql`excluded.quality`,
//         color: sql`excluded.color`,
//         hexCode: sql`excluded.hex_code`,
//         colorName: sql`excluded.color_name`,
//         width: sql`excluded.width`,
//         height: sql`excluded.height`,
//         pricePerMeter: sql`excluded.price_per_meter`,
//         unitType: sql`excluded.unit_type`,
//         currentStock: sql`excluded.current_stock`,
//         hsnCode: sql`excluded.hsn_code`,
//         gstPercent: sql`excluded.gst_percent`,
//         vendor: sql`excluded.vendor`,
//         location: sql`excluded.location`,
//         locationStocks: sql`excluded.location_stocks`,
//         // images: sql`excluded.images`,   // excluded to preserve user-uploaded images
//         reorderLevel: sql`excluded.reorder_level`,
//         minimumLevel: sql`excluded.minimum_level`,
//         maximumLevel: sql`excluded.maximum_level`,
//         updatedBy: sql`excluded.created_by`,
//         updatedAt: sql`now()`,
//       },
//     })
//     .returning({ id: fabricsTable.id });

//   console.log(`[master-seed] Fabrics: ${result.length} inserted/updated`);
// }

/**
 * Clients – required fields: clientCode, brandName, contactName, email, contactNo, createdBy
 */
async function seedClients(): Promise<void> {
  const result = await db
    .insert(clientsTable)
    .values([
      {
        clientCode: "CL001",
        brandName: "Zara",
        contactName: "John Doe",
        email: "john@zara.com",
        contactNo: "9876543210",
        createdBy: "system",
      },
      {
        clientCode: "CL002",
        brandName: "H&M",
        contactName: "Jane Smith",
        email: "jane@hm.com",
        contactNo: "9876543211",
        createdBy: "system",
      },
      {
        clientCode: "CL003",
        brandName: "Uniqlo",
        contactName: "Taro Yamada",
        email: "taro@uniqlo.com",
        contactNo: "9876543212",
        createdBy: "system",
      },
    ])
    .onConflictDoNothing()
    .returning({ id: clientsTable.id });

  console.log(`[master-seed] Clients: ${result.length} inserted`);
}

/**
 * Vendors – required fields: vendorCode, brandName, createdBy
 */
async function seedVendors(): Promise<void> {
  const result = await db
    .insert(vendorsTable)
    .values([
      {
        vendorCode: "VEN001",
        brandName: "Arvind Mills",
        contactName: "Rahul Sharma",
        email: "rahul@arvind.com",
        contactNo: "9876543220",
        createdBy: "system",
      },
      {
        vendorCode: "VEN002",
        brandName: "Raymond",
        contactName: "Amit Patel",
        email: "amit@raymond.com",
        contactNo: "9876543221",
        createdBy: "system",
      },
      {
        vendorCode: "VEN003",
        brandName: "Sutlej Textiles",
        contactName: "Sunil Kumar",
        email: "sunil@sutlej.com",
        contactNo: "9876543222",
        createdBy: "system",
      },
    ])
    .onConflictDoNothing()
    .returning({ id: vendorsTable.id });

  console.log(`[master-seed] Vendors: ${result.length} inserted`);
}

/**
 * Style Categories – required: categoryName, createdBy
 */
async function seedStyleCategories(): Promise<void> {
  const result = await db
    .insert(styleCategoriesTable)
    .values([
      { categoryName: "Kurti", createdBy: "system" },
      { categoryName: "Saree", createdBy: "system" },
      { categoryName: "Lehenga", createdBy: "system" },
      { categoryName: "Shirt", createdBy: "system" },
      { categoryName: "Trouser", createdBy: "system" },
      { categoryName: "Jacket", createdBy: "system" },
      { categoryName: "Dress", createdBy: "system" },
      { categoryName: "Skirt", createdBy: "system" },
    ])
    .onConflictDoNothing()
    .returning({ id: styleCategoriesTable.id });

  console.log(`[master-seed] Style categories: ${result.length} inserted`);
}

/**
 * Swatches – required fields: swatchCode, swatchName, createdBy
 * approvalStatus has default 'Pending', so optional.
 *
 * NOTE: On conflict we update all fields EXCEPT `attachments`, `wipMedia`, and `finalMedia`
 * to preserve user‑uploaded media.
 */
async function seedSwatches(): Promise<void> {
  const swatchData = [
    {
      swatchCode: "SW001",
      swatchName: "Red Cotton",
      client: "CL001",
      swatchCategory: "Fabric",
      fabric: "Cotton",
      location: "Mumbai",
      swatchDate: "2026-08-01",
      length: "10",
      width: "5",
      unitType: "Meter",
      hours: "2",
      attachments: [],
      colorName: "Red",
      hexCode: "#FF0000",
      finishType: "Matte",
      gsm: "180",
      wipMedia: [],
      finalMedia: [],
      approvalStatus: "Approved",
      remarks: "Premium red cotton swatch",
      createdBy: "system",
    },
    {
      swatchCode: "SW002",
      swatchName: "Blue Silk",
      client: "CL002",
      swatchCategory: "Fabric",
      fabric: "Silk",
      location: "Bangalore",
      swatchDate: "2026-08-02",
      length: "8",
      width: "4",
      unitType: "Meter",
      hours: "3",
      attachments: [],
      colorName: "Blue",
      hexCode: "#0000FF",
      finishType: "Glossy",
      gsm: "120",
      wipMedia: [],
      finalMedia: [],
      approvalStatus: "Approved",
      remarks: "Premium blue silk swatch",
      createdBy: "system",
    },
    {
      swatchCode: "SW003",
      swatchName: "Gold Sequins",
      client: "CL001",
      swatchCategory: "Embellishment",
      fabric: "Polyester",
      location: "Mumbai",
      swatchDate: "2026-08-03",
      length: "5",
      width: "3",
      unitType: "Meter",
      hours: "4",
      attachments: [],
      colorName: "Gold",
      hexCode: "#FFD700",
      finishType: "Metallic",
      gsm: "250",
      wipMedia: [],
      finalMedia: [],
      approvalStatus: "Pending",
      remarks: "Gold sequin embellishment",
      createdBy: "system",
    },
    {
      swatchCode: "SW004",
      swatchName: "Floral Print",
      client: "CL003",
      swatchCategory: "Print",
      fabric: "Cotton",
      location: "Delhi",
      swatchDate: "2026-08-04",
      length: "12",
      width: "5",
      unitType: "Meter",
      hours: "2",
      attachments: [],
      colorName: "Multi Color",
      hexCode: "#FF69B4",
      finishType: "Printed",
      gsm: "160",
      wipMedia: [],
      finalMedia: [],
      approvalStatus: "Pending",
      remarks: "Floral printed cotton fabric",
      createdBy: "system",
    },
    {
      swatchCode: "SW005",
      swatchName: "Black Velvet",
      client: "CL002",
      swatchCategory: "Fabric",
      fabric: "Velvet",
      location: "Bangalore",
      swatchDate: "2026-08-05",
      length: "6",
      width: "4",
      unitType: "Meter",
      hours: "3",
      attachments: [],
      colorName: "Black",
      hexCode: "#000000",
      finishType: "Soft",
      gsm: "300",
      wipMedia: [],
      finalMedia: [],
      approvalStatus: "Approved",
      remarks: "Premium black velvet",
      createdBy: "system",
    },
  ];

  const result = await db
    .insert(swatchesTable)
    .values(swatchData)
    .onConflictDoUpdate({
      target: swatchesTable.swatchCode,
      set: {
        swatchName: sql`excluded.swatch_name`,
        client: sql`excluded.client`,
        swatchCategory: sql`excluded.swatch_category`,
        fabric: sql`excluded.fabric`,
        location: sql`excluded.location`,
        swatchDate: sql`excluded.swatch_date`,
        length: sql`excluded.length`,
        width: sql`excluded.width`,
        unitType: sql`excluded.unit_type`,
        hours: sql`excluded.hours`,
        // attachments: sql`excluded.attachments`,   // excluded to preserve user-uploaded attachments
        colorName: sql`excluded.color_name`,
        hexCode: sql`excluded.hex_code`,
        finishType: sql`excluded.finish_type`,
        gsm: sql`excluded.gsm`,
        // wipMedia: sql`excluded.wip_media`,         // excluded to preserve user-uploaded media
        // finalMedia: sql`excluded.final_media`,     // excluded to preserve user-uploaded media
        approvalStatus: sql`excluded.approval_status`,
        remarks: sql`excluded.remarks`,
        updatedBy: sql`excluded.created_by`,
        updatedAt: sql`now()`,
      },
    })
    .returning({
      id: swatchesTable.id,
      swatchCode: swatchesTable.swatchCode,
    });

  console.log(
    `[master-seed] Swatches: ${result.length} inserted/updated`,
  );
}

/**
 * Style Master
 *
 * NOTE: On conflict we update all fields EXCEPT `wipMedia` and `finalMedia`
 * to preserve user‑uploaded media.
 */
async function seedStyles(): Promise<void> {
  const styleData = [
    {
      client: "CL001",
      styleNo: "ST-001",
      invoiceNo: "INV-2026-001",
      description: "Premium cotton casual shirt",
      attachLink: "https://example.com/styles/ST-001",
      placeOfIssue: "Mumbai",
      vendorPoNo: "PO-CL001-001",
      shippingDate: "2026-08-20",
      styleCategory: "Shirt",
      referenceSwatchId: "SW-001",
      wipMedia: [],
      finalMedia: [],
      createdBy: "system",
    },
    {
      client: "CL002",
      styleNo: "ST-002",
      invoiceNo: "INV-2026-002",
      description: "Classic denim jacket",
      attachLink: "https://example.com/styles/ST-002",
      placeOfIssue: "Bangalore",
      vendorPoNo: "PO-CL002-002",
      shippingDate: "2026-08-25",
      styleCategory: "Jacket",
      referenceSwatchId: "SW-002",
      wipMedia: [],
      finalMedia: [],
      createdBy: "system",
    },
    {
      client: "CL003",
      styleNo: "ST-003",
      invoiceNo: "INV-2026-003",
      description: "Premium silk evening dress",
      attachLink: "https://example.com/styles/ST-003",
      placeOfIssue: "Delhi",
      vendorPoNo: "PO-CL003-003",
      shippingDate: "2026-09-01",
      styleCategory: "Dress",
      referenceSwatchId: "SW-003",
      wipMedia: [],
      finalMedia: [],
      createdBy: "system",
    },
    {
      client: "CL001",
      styleNo: "ST-004",
      invoiceNo: "INV-2026-004",
      description: "Linen summer trousers",
      attachLink: "https://example.com/styles/ST-004",
      placeOfIssue: "Mumbai",
      vendorPoNo: "PO-CL001-004",
      shippingDate: "2026-09-05",
      styleCategory: "Trousers",
      referenceSwatchId: "SW-004",
      wipMedia: [],
      finalMedia: [],
      createdBy: "system",
    },
    {
      client: "CL002",
      styleNo: "ST-005",
      invoiceNo: "INV-2026-005",
      description: "Polyester sports hoodie",
      attachLink: "https://example.com/styles/ST-005",
      placeOfIssue: "Bangalore",
      vendorPoNo: "PO-CL002-005",
      shippingDate: "2026-09-10",
      styleCategory: "Hoodie",
      referenceSwatchId: "SW-005",
      wipMedia: [],
      finalMedia: [],
      createdBy: "system",
    },
  ];

  let inserted = 0;
  let updated = 0;

  await db.transaction(async (tx) => {
    for (const item of styleData) {
      // Find only an ACTIVE matching style.
      const existing = await tx
        .select({
          id: stylesTable.id,
        })
        .from(stylesTable)
        .where(
          and(
            eq(stylesTable.client, item.client),
            eq(stylesTable.styleNo, item.styleNo),
            eq(stylesTable.isDeleted, false),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        // Existing active record -> update it (but preserve media fields)
        await tx
          .update(stylesTable)
          .set({
            invoiceNo: item.invoiceNo,
            description: item.description,
            attachLink: item.attachLink,
            placeOfIssue: item.placeOfIssue,
            vendorPoNo: item.vendorPoNo,
            shippingDate: item.shippingDate,
            styleCategory: item.styleCategory,
            referenceSwatchId: item.referenceSwatchId,
            // wipMedia: item.wipMedia,       // excluded to preserve user-uploaded media
            // finalMedia: item.finalMedia,   // excluded to preserve user-uploaded media
            updatedBy: item.createdBy,
            updatedAt: new Date(),
          })
          .where(eq(stylesTable.id, existing[0].id));

        updated++;
      } else {
        // No active record -> insert new row
        await tx.insert(stylesTable).values(item);
        inserted++;
      }
    }
  });

  console.log(
    `[master-seed] Styles: ${inserted} inserted, ${updated} updated`,
  );
}

/**
 * Item Master – assumed schema has at least 'name', 'itemType', 'unitType', 'createdBy'
 *
 * NOTE: On conflict we update all fields EXCEPT `images` to preserve user-uploaded images.
 */
async function seedItems(): Promise<void> {
  const itemData = [
    {
      itemCode: "ITEM001",
      itemName: "Corrugated Carton",
      itemType: "Packaging",
      description: "Standard corrugated carton for garment packing and shipment",
      unitType: "Piece",
      unitPrice: "0.00",
      hsnCode: "",
      gstPercent: "18",
      currentStock: "0",
      locationStocks: [],
      images: [],
      reorderLevel: "0",
      minimumLevel: "0",
      maximumLevel: "0",
      createdBy: "system",
    },
    {
      itemCode: "ITEM002",
      itemName: "Poly Bag",
      itemType: "Packaging",
      description: "Transparent poly bag for individual garment packing",
      unitType: "Piece",
      unitPrice: "0.00",
      hsnCode: "",
      gstPercent: "18",
      currentStock: "0",
      locationStocks: [],
      images: [],
      reorderLevel: "0",
      minimumLevel: "0",
      maximumLevel: "0",
      createdBy: "system",
    },
    {
      itemCode: "ITEM003",
      itemName: "Bubble Wrap",
      itemType: "Packaging",
      description: "Protective bubble wrap for packing delicate garments and accessories",
      unitType: "Roll",
      unitPrice: "0.00",
      hsnCode: "",
      gstPercent: "18",
      currentStock: "0",
      locationStocks: [],
      images: [],
      reorderLevel: "0",
      minimumLevel: "0",
      maximumLevel: "0",
      createdBy: "system",
    },
    {
      itemCode: "ITEM004",
      itemName: "Tissue Paper",
      itemType: "Packaging",
      description: "Soft tissue paper used for premium garment presentation and packing",
      unitType: "Piece",
      unitPrice: "0.00",
      hsnCode: "",
      gstPercent: "18",
      currentStock: "0",
      locationStocks: [],
      images: [],
      reorderLevel: "0",
      minimumLevel: "0",
      maximumLevel: "0",
      createdBy: "system",
    },
  ];

  const result = await db
    .insert(itemsTable)
    .values(itemData)
    .onConflictDoNothing()
    .returning({
      id: itemsTable.id,
      itemCode: itemsTable.itemCode,
    });

  console.log(
    `[master-seed] Items: ${result.length} inserted`,
  );
}


async function seedShippingVendors(): Promise<void> {
  const shippingVendorData = [
    {
        vendorName: "DHL Express",
        contactPerson: "Amit Sharma",
        phoneNumber: "+91 9876543210",
        emailAddress: "amit.sharma@dhl.example.com",
        weightRatePerKg: "180.00",
        minimumCharge: "350.00",
        remarks: "International express courier services with priority delivery.",
        isActive: true,
        isDeleted: false,
    },
    {
        vendorName: "FedEx",
        contactPerson: "Priya Mehta",
        phoneNumber: "+91 9823456712",
        emailAddress: "priya.mehta@fedex.example.com",
        weightRatePerKg: "165.00",
        minimumCharge: "300.00",
        remarks: "Domestic and international parcel shipping with tracking.",
        isActive: true,
        isDeleted: false,
    },
    {
        vendorName: "Blue Dart",
        contactPerson: "Rahul Verma",
        phoneNumber: "+91 9911223344",
        emailAddress: "rahul.verma@bluedart.example.com",
        weightRatePerKg: "95.00",
        minimumCharge: "180.00",
        remarks: "Reliable domestic courier service for garment samples and documents.",
        isActive: true,
        isDeleted: false,
    },
    {
        vendorName: "DTDC",
        contactPerson: "Sneha Patel",
        phoneNumber: "+91 9845671234",
        emailAddress: "sneha.patel@dtdc.example.com",
        weightRatePerKg: "85.00",
        minimumCharge: "150.00",
        remarks: "Domestic and international courier services with standard delivery.",
        isActive: true,
        isDeleted: false,
    },
    {
        vendorName: "Delhivery",
        contactPerson: "Rohit Kumar",
        phoneNumber: "+91 9765432187",
        emailAddress: "rohit.kumar@delhivery.example.com",
        weightRatePerKg: "75.00",
        minimumCharge: "120.00",
        remarks: "E-commerce and domestic logistics with door-to-door delivery.",
        isActive: true,
        isDeleted: false,
    },
    {
        vendorName: "Ecom Express",
        contactPerson: "Neha Singh",
        phoneNumber: "+91 9898765432",
        emailAddress: "neha.singh@ecomexpress.example.com",
        weightRatePerKg: "70.00",
        minimumCharge: "110.00",
        remarks: "Domestic parcel delivery and e-commerce logistics.",
        isActive: true,
        isDeleted: false,
    },
    {
        vendorName: "Aramex",
        contactPerson: "Vikram Rao",
        phoneNumber: "+91 9812345678",
        emailAddress: "vikram.rao@aramex.example.com",
        weightRatePerKg: "145.00",
        minimumCharge: "280.00",
        remarks: "International shipping and express delivery services.",
        isActive: true,
        isDeleted: false,
    },
    {
        vendorName: "India Post",
        contactPerson: "Sanjay Joshi",
        phoneNumber: "+91 9753124680",
        emailAddress: "sanjay.joshi@indiapost.example.com",
        weightRatePerKg: "55.00",
        minimumCharge: "80.00",
        remarks: "Cost-effective domestic parcel and registered shipping services.",
        isActive: true,
        isDeleted: false,
    },
    ];

  let inserted = 0;
  let updated = 0;

  await db.transaction(async (tx) => {
    for (const vendor of shippingVendorData) {
      // Look for an existing ACTIVE/non-deleted vendor.
      const existing = await tx
        .select({
          id: shippingVendors.id,
        })
        .from(shippingVendors)
        .where(
          and(
            eq(shippingVendors.vendorName, vendor.vendorName),
            eq(shippingVendors.isDeleted, false),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        // Already exists -> UPDATE, don't insert another row.
        await tx
          .update(shippingVendors)
          .set({
            contactPerson: vendor.contactPerson,
            phoneNumber: vendor.phoneNumber,
            emailAddress: vendor.emailAddress,
            weightRatePerKg: vendor.weightRatePerKg,
            minimumCharge: vendor.minimumCharge,
            remarks: vendor.remarks,
            isActive: vendor.isActive,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(shippingVendors.id, existing[0].id));

        updated++;
      } else {
        // No active vendor exists -> INSERT.
        await tx.insert(shippingVendors).values(vendor);

        inserted++;
      }
    }
  });

  console.log(
    `[master-seed] Shipping vendors: ${inserted} inserted, ${updated} updated`,
  );
}

// --------------------- Main seed orchestration ---------------------

export async function seedMasterData(): Promise<void> {
  console.log("[master-seed] Starting master data seeding...");

  // 1. Base lookup tables (no dependencies)
  await seedItemTypes();
  await seedUnitTypes();
  await seedDepartments();
  await seedSwatchCategories();

  // 2. Warehouses – seeded early so that all location references are valid
  await seedWarehouseLocations();

  // 3. HSN, Clients, Vendors, Style Categories (independent)
  await seedHsn();
  await seedClients();
  await seedVendors();
  await seedStyleCategories();
  await seedShippingVendors();

  // 4. Data that references warehouses, clients, vendors, HSN, etc.
  // await seedMaterials();
  // await seedFabrics();
  await seedSwatches();
  await seedStyles();
  await seedItems();

  console.log("[master-seed] Master data seeding completed.");
}