import { db, stylesTable, entityTagsTable, eq, and, sql } from "@workspace/db";

interface StyleSeedData {
  clientCode: string;            // e.g., "CL001"
  description: string;
  styleCategory: string;
  referenceSwatchCode: string;   // swatchCode from SwatchSeeder, e.g., "CL001-SW001"
  placeOfIssue: string;
  shippingDate: string;
  invoiceNo: string;
  vendorPoNo: string;
  attachLink?: string;
}

export async function seedStyles(): Promise<void> {
  // Map clientCode -> brandName (must match SwatchSeeder)
  const clientMap: Record<string, { brand: string; code: string }> = {
    CL001: { brand: "Zara", code: "ZARA" },
    CL002: { brand: "H&M", code: "HM" },
    CL003: { brand: "Uniqlo", code: "UNIQLO" },
    CL004: { brand: "Adidas", code: "ADIDAS" },
    CL005: { brand: "Nike", code: "NIKE" },
    CL006: { brand: "Levi's", code: "LEVIS" },
    CL007: { brand: "Puma", code: "PUMA" },
    CL008: { brand: "Reebok", code: "REEBOK" },
    CL009: { brand: "Under Armour", code: "UNDERARMOUR" },
    CL010: { brand: "Decathlon", code: "DECATHLON" },
    CL011: { brand: "Lululemon", code: "LULULEMON" },
    CL012: { brand: "Fila", code: "FILA" },
    CL013: { brand: "New Balance", code: "NEWBALANCE" },
    CL014: { brand: "ASICS", code: "ASICS" },
    CL015: { brand: "Skechers", code: "SKECHERS" },
    CL016: { brand: "Vans", code: "VANS" },
    CL017: { brand: "Timberland", code: "TIMBERLAND" },
    CL018: { brand: "Converse", code: "CONVERSE" },
    CL019: { brand: "The North Face", code: "NORTHFACE" },
    CL020: { brand: "Urban Outfitters", code: "URBANOUTFIT" },
  };

  // Define styles – use clientCode and reference swatch codes from SwatchSeeder
  const styleData: StyleSeedData[] = [
    // Zara styles
    {
      clientCode: "CL001",
      description: "Premium cotton casual shirt",
      styleCategory: "Shirt",
      referenceSwatchCode: "CL001-SW001", // matches Red Cotton
      placeOfIssue: "Warehouse A",
      shippingDate: "2026-08-20",
      invoiceNo: "INV-2026-001",
      vendorPoNo: "PO-CL001-001",
      attachLink: "https://example.com/styles/ZARA001",
    },
    {
      clientCode: "CL001",
      description: "Embellished evening top",
      styleCategory: "Top",
      referenceSwatchCode: "CL001-SW002", // matches Gold Sequins
      placeOfIssue: "Warehouse A",
      shippingDate: "2026-09-05",
      invoiceNo: "INV-2026-002",
      vendorPoNo: "PO-CL001-002",
      attachLink: "https://example.com/styles/ZARA002",
    },
    // H&M styles
    {
      clientCode: "CL002",
      description: "Classic denim jacket",
      styleCategory: "Jacket",
      referenceSwatchCode: "CL002-SW001", // matches Blue Silk
      placeOfIssue: "Warehouse B",
      shippingDate: "2026-08-25",
      invoiceNo: "INV-2026-003",
      vendorPoNo: "PO-CL002-001",
      attachLink: "https://example.com/styles/HM001",
    },
    {
      clientCode: "CL002",
      description: "Velvet evening dress",
      styleCategory: "Dress",
      referenceSwatchCode: "CL002-SW002", // matches Black Velvet
      placeOfIssue: "Warehouse B",
      shippingDate: "2026-09-10",
      invoiceNo: "INV-2026-004",
      vendorPoNo: "PO-CL002-002",
      attachLink: "https://example.com/styles/HM002",
    },
    // Uniqlo styles
    {
      clientCode: "CL003",
      description: "Floral print summer dress",
      styleCategory: "Dress",
      referenceSwatchCode: "CL003-SW001", // matches Floral Print
      placeOfIssue: "Warehouse C",
      shippingDate: "2026-09-01",
      invoiceNo: "INV-2026-005",
      vendorPoNo: "PO-CL003-001",
      attachLink: "https://example.com/styles/UNIQLO001",
    },
    // Adidas styles
    {
      clientCode: "CL004",
      description: "Performance running shorts",
      styleCategory: "Shorts",
      referenceSwatchCode: "CL004-SW001", // matches Green Polyester
      placeOfIssue: "Warehouse D",
      shippingDate: "2026-08-15",
      invoiceNo: "INV-2026-006",
      vendorPoNo: "PO-CL004-001",
      attachLink: "https://example.com/styles/ADIDAS001",
    },
    // Nike styles
    {
      clientCode: "CL005",
      description: "Breathable mesh sports jersey",
      styleCategory: "Jersey",
      referenceSwatchCode: "CL005-SW001", // matches White Mesh
      placeOfIssue: "Warehouse D",
      shippingDate: "2026-08-18",
      invoiceNo: "INV-2026-007",
      vendorPoNo: "PO-CL005-001",
      attachLink: "https://example.com/styles/NIKE001",
    },
    // Levi's styles
    {
      clientCode: "CL006",
      description: "Classic denim jeans",
      styleCategory: "Jeans",
      referenceSwatchCode: "CL006-SW001", // matches Denim Blue
      placeOfIssue: "Warehouse A",
      shippingDate: "2026-08-22",
      invoiceNo: "INV-2026-008",
      vendorPoNo: "PO-CL006-001",
      attachLink: "https://example.com/styles/LEVIS001",
    },
    // Puma styles
    {
      clientCode: "CL007",
      description: "Lightweight training hoodie",
      styleCategory: "Hoodie",
      referenceSwatchCode: "CL007-SW001", // matches Orange Nylon
      placeOfIssue: "Warehouse B",
      shippingDate: "2026-09-02",
      invoiceNo: "INV-2026-009",
      vendorPoNo: "PO-CL007-001",
      attachLink: "https://example.com/styles/PUMA001",
    },
    // Reebok styles
    {
      clientCode: "CL008",
      description: "Compression fit leggings",
      styleCategory: "Leggings",
      referenceSwatchCode: "CL008-SW001", // matches Grey Spandex
      placeOfIssue: "Warehouse C",
      shippingDate: "2026-08-28",
      invoiceNo: "INV-2026-010",
      vendorPoNo: "PO-CL008-001",
      attachLink: "https://example.com/styles/REEBOK001",
    },
    // Under Armour styles
    {
      clientCode: "CL009",
      description: "Base layer compression shirt",
      styleCategory: "Shirt",
      referenceSwatchCode: "CL009-SW001", // matches Black Compression
      placeOfIssue: "Warehouse D",
      shippingDate: "2026-09-08",
      invoiceNo: "INV-2026-011",
      vendorPoNo: "PO-CL009-001",
      attachLink: "https://example.com/styles/UNDERARMOUR001",
    },
    // Decathlon styles
    {
      clientCode: "CL010",
      description: "Waterproof hiking jacket",
      styleCategory: "Jacket",
      referenceSwatchCode: "CL010-SW001", // matches Yellow Polyester
      placeOfIssue: "Warehouse D",
      shippingDate: "2026-08-30",
      invoiceNo: "INV-2026-012",
      vendorPoNo: "PO-CL010-001",
      attachLink: "https://example.com/styles/DECATHLON001",
    },
    // Lululemon styles
    {
      clientCode: "CL011",
      description: "Yoga leggings",
      styleCategory: "Leggings",
      referenceSwatchCode: "CL011-SW001", // matches Purple Nulu
      placeOfIssue: "Warehouse A",
      shippingDate: "2026-09-12",
      invoiceNo: "INV-2026-013",
      vendorPoNo: "PO-CL011-001",
      attachLink: "https://example.com/styles/LULULEMON001",
    },
    // Fila styles
    {
      clientCode: "CL012",
      description: "Classic tennis polo",
      styleCategory: "Polo",
      referenceSwatchCode: "CL012-SW001", // matches Navy Terry
      placeOfIssue: "Warehouse B",
      shippingDate: "2026-08-26",
      invoiceNo: "INV-2026-014",
      vendorPoNo: "PO-CL012-001",
      attachLink: "https://example.com/styles/FILA001",
    },
    // New Balance styles
    {
      clientCode: "CL013",
      description: "Warm fleece joggers",
      styleCategory: "Joggers",
      referenceSwatchCode: "CL013-SW001", // matches Pink Fleece
      placeOfIssue: "Warehouse C",
      shippingDate: "2026-09-15",
      invoiceNo: "INV-2026-015",
      vendorPoNo: "PO-CL013-001",
      attachLink: "https://example.com/styles/NEWBALANCE001",
    },
    // ASICS styles
    {
      clientCode: "CL014",
      description: "Performance running singlet",
      styleCategory: "Singlet",
      referenceSwatchCode: "CL014-SW001", // matches Silver Lycra
      placeOfIssue: "Warehouse D",
      shippingDate: "2026-08-20",
      invoiceNo: "INV-2026-016",
      vendorPoNo: "PO-CL014-001",
      attachLink: "https://example.com/styles/ASICS001",
    },
    // Skechers styles
    {
      clientCode: "CL015",
      description: "Casual slip-on shoes",
      styleCategory: "Shoes",
      referenceSwatchCode: "CL015-SW001", // matches Beige Suede
      placeOfIssue: "Warehouse A",
      shippingDate: "2026-09-03",
      invoiceNo: "INV-2026-017",
      vendorPoNo: "PO-CL015-001",
      attachLink: "https://example.com/styles/SKECHERS001",
    },
    // Vans styles
    {
      clientCode: "CL016",
      description: "Canvas sneakers",
      styleCategory: "Sneakers",
      referenceSwatchCode: "CL016-SW001", // matches Checkered Canvas
      placeOfIssue: "Warehouse B",
      shippingDate: "2026-08-27",
      invoiceNo: "INV-2026-018",
      vendorPoNo: "PO-CL016-001",
      attachLink: "https://example.com/styles/VANS001",
    },
    // Timberland styles
    {
      clientCode: "CL017",
      description: "Leather boots",
      styleCategory: "Boots",
      referenceSwatchCode: "CL017-SW001", // matches Brown Leather
      placeOfIssue: "Warehouse C",
      shippingDate: "2026-09-18",
      invoiceNo: "INV-2026-019",
      vendorPoNo: "PO-CL017-001",
      attachLink: "https://example.com/styles/TIMBERLAND001",
    },
    // Converse styles
    {
      clientCode: "CL018",
      description: "Classic canvas sneakers",
      styleCategory: "Sneakers",
      referenceSwatchCode: "CL018-SW001", // matches Off-White Duck Canvas
      placeOfIssue: "Warehouse D",
      shippingDate: "2026-08-29",
      invoiceNo: "INV-2026-020",
      vendorPoNo: "PO-CL018-001",
      attachLink: "https://example.com/styles/CONVERSE001",
    },
    // The North Face styles
    {
      clientCode: "CL019",
      description: "Waterproof down jacket",
      styleCategory: "Jacket",
      referenceSwatchCode: "CL019-SW001", // matches Black Gore-Tex
      placeOfIssue: "Warehouse A",
      shippingDate: "2026-09-20",
      invoiceNo: "INV-2026-021",
      vendorPoNo: "PO-CL019-001",
      attachLink: "https://example.com/styles/NORTHFACE001",
    },
    // Urban Outfitters styles
    {
      clientCode: "CL020",
      description: "Paisley print blouse",
      styleCategory: "Blouse",
      referenceSwatchCode: "CL020-SW001", // matches Paisley Print
      placeOfIssue: "Warehouse B",
      shippingDate: "2026-09-22",
      invoiceNo: "INV-2026-022",
      vendorPoNo: "PO-CL020-001",
      attachLink: "https://example.com/styles/URBANOUTFIT001",
    },
  ];

  // Keep a counter per client to generate unique styleNo
  const clientCounters: Record<string, number> = {};

  await db.transaction(async (tx) => {
    let inserted = 0;
    let updated = 0;

    for (const data of styleData) {
      const clientInfo = clientMap[data.clientCode];
      if (!clientInfo) {
        console.warn(`[style-seed] Client ${data.clientCode} not found, skipping style "${data.description}"`);
        continue;
      }

      const brandName = clientInfo.brand;
      const brandCode = clientInfo.code;

      // Increment counter for this client
      if (!clientCounters[data.clientCode]) clientCounters[data.clientCode] = 0;
      clientCounters[data.clientCode] += 1;
      const seq = String(clientCounters[data.clientCode]).padStart(3, "0");
      const styleNo = `${brandCode}${seq}`; // e.g., ZARA001, HM001, etc.

      // Generate tags from description, category, and brand
      const tags = [
        brandName,
        data.styleCategory,
        data.description.split(" ").slice(0, 2).join(" "),
      ].filter(tag => tag.length > 0);

      // Prepare style record
      const styleRecord = {
        client: brandName, // store brand name, not code
        styleNo,
        invoiceNo: data.invoiceNo,
        description: data.description,
        attachLink: data.attachLink || `https://example.com/styles/${styleNo}`,
        placeOfIssue: data.placeOfIssue,
        vendorPoNo: data.vendorPoNo,
        shippingDate: data.shippingDate,
        styleCategory: data.styleCategory,
        referenceSwatchId: data.referenceSwatchCode, // e.g., CL001-SW001
        wipMedia: [
          {
            url: `/uploads/styles/${styleNo}/wip/sample_wip_1.png`,
            name: "sample_wip_1.png",
            type: "image",
          },
          {
            url: `/uploads/styles/${styleNo}/wip/sample_wip_2.png`,
            name: "sample_wip_2.png",
            type: "image",
          },
        ],
        finalMedia: [
          {
            url: `/uploads/styles/${styleNo}/final/sample_final_1.png`,
            name: "sample_final_1.png",
            type: "image",
          },
          {
            url: `/uploads/styles/${styleNo}/final/sample_final_2.png`,
            name: "sample_final_2.png",
            type: "image",
          },
        ],
        createdBy: "system",
      };

      // Check if style already exists (by client + styleNo)
      const existing = await tx
        .select({ id: stylesTable.id })
        .from(stylesTable)
        .where(
          and(
            eq(stylesTable.client, brandName),
            eq(stylesTable.styleNo, styleNo),
            eq(stylesTable.isDeleted, false)
          )
        )
        .limit(1);

      let styleId: number;

      if (existing.length > 0) {
        styleId = existing[0].id;
        // Update existing (preserve media)
        await tx
          .update(stylesTable)
          .set({
            invoiceNo: data.invoiceNo,
            description: data.description,
            attachLink: styleRecord.attachLink,
            placeOfIssue: data.placeOfIssue,
            vendorPoNo: data.vendorPoNo,
            shippingDate: data.shippingDate,
            styleCategory: data.styleCategory,
            referenceSwatchId: data.referenceSwatchCode,
            // wipMedia: styleRecord.wipMedia, // preserve
            // finalMedia: styleRecord.finalMedia, // preserve
            updatedBy: "system",
            updatedAt: new Date(),
          })
          .where(eq(stylesTable.id, styleId));
        updated++;
      } else {
        // Insert new style
        const [insertedStyle] = await tx
          .insert(stylesTable)
          .values(styleRecord)
          .returning({ id: stylesTable.id });
        styleId = insertedStyle.id;
        inserted++;
      }

      // Insert tags (with onConflictDoNothing to avoid duplicates)
      for (const tag of tags) {
        await tx
          .insert(entityTagsTable)
          .values({
            entityType: "style_master",
            entityId: styleId,
            tag,
          })
          .onConflictDoNothing();
      }
    }
  });

  // console.log(`[master-seed] Styles: ${inserted} inserted, ${updated} updated`);
}