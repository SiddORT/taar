import { db, swatchesTable, entityTagsTable, sql } from "@workspace/db";

interface SwatchSeedData {
  clientCode: string;        // e.g., "CL001"
  swatchName: string;
  swatchCategory: string;
  fabricType: string;
  quality: string;           // e.g., "Premium"
  location: string;
  swatchDate: string;
  length: string;
  width: string;
  unitType: string;
  hours: string;
  colorName: string;
  hexCode: string;
  finishType: string;
  gsm: string;
  approvalStatus: string;
  remarks: string;
  // We'll generate tags from these fields
}

export async function seedSwatches(): Promise<void> {
  // Map clientCode -> brandName (from your client seeder)
  const clientMap: Record<string, string> = {
    CL001: "Zara",
    CL002: "H&M",
    CL003: "Uniqlo",
    CL004: "Adidas",
    CL005: "Nike",
    CL006: "Levi's",
    CL007: "Puma",
    CL008: "Reebok",
    CL009: "Under Armour",
    CL010: "Decathlon",
    CL011: "Lululemon",
    CL012: "Fila",
    CL013: "New Balance",
    CL014: "ASICS",
    CL015: "Skechers",
    CL016: "Vans",
    CL017: "Timberland",
    CL018: "Converse",
    CL019: "The North Face",
    CL020: "Urban Outfitters",
  };

  // Define swatch data – use clientCode for code generation and brand mapping
  const swatchData: SwatchSeedData[] = [
    {
      clientCode: "CL001",
      swatchName: "Red Cotton",
      swatchCategory: "Fabric",
      fabricType: "Cotton",
      quality: "Premium",
      location: "Warehouse A",
      swatchDate: "2026-08-01",
      length: "10",
      width: "5",
      unitType: "Meter",
      hours: "2",
      colorName: "Red",
      hexCode: "#FF0000",
      finishType: "Matte",
      gsm: "180",
      approvalStatus: "Pending",
      remarks: "Premium red cotton swatch",
    },
    {
      clientCode: "CL002",
      swatchName: "Blue Silk",
      swatchCategory: "Fabric",
      fabricType: "Silk",
      quality: "Premium",
      location: "Warehouse B",
      swatchDate: "2026-08-02",
      length: "8",
      width: "4",
      unitType: "Meter",
      hours: "3",
      colorName: "Blue",
      hexCode: "#0000FF",
      finishType: "Glossy",
      gsm: "120",
      approvalStatus: "Approved",
      remarks: "Premium blue silk swatch",
    },
    {
      clientCode: "CL001",
      swatchName: "Gold Sequins",
      swatchCategory: "Embellishment",
      fabricType: "Polyester",
      quality: "Standard",
      location: "Warehouse A",
      swatchDate: "2026-08-03",
      length: "5",
      width: "3",
      unitType: "Meter",
      hours: "4",
      colorName: "Gold",
      hexCode: "#FFD700",
      finishType: "Metallic",
      gsm: "250",
      approvalStatus: "Pending",
      remarks: "Gold sequin embellishment",
    },
    {
      clientCode: "CL003",
      swatchName: "Floral Print",
      swatchCategory: "Print",
      fabricType: "Cotton",
      quality: "Standard",
      location: "Warehouse C",
      swatchDate: "2026-08-04",
      length: "12",
      width: "5",
      unitType: "Meter",
      hours: "2",
      colorName: "Multi Color",
      hexCode: "#FF69B4",
      finishType: "Printed",
      gsm: "160",
      approvalStatus: "Pending",
      remarks: "Floral printed cotton fabric",
    },
    {
      clientCode: "CL002",
      swatchName: "Black Velvet",
      swatchCategory: "Fabric",
      fabricType: "Velvet",
      quality: "Premium",
      location: "Warehouse B",
      swatchDate: "2026-08-05",
      length: "6",
      width: "4",
      unitType: "Meter",
      hours: "3",
      colorName: "Black",
      hexCode: "#000000",
      finishType: "Soft",
      gsm: "300",
      approvalStatus: "Approved",
      remarks: "Premium black velvet",
    },
    // Add more swatches as needed for other clients
    // For example, CL004
    {
      clientCode: "CL004",
      swatchName: "Green Polyester",
      swatchCategory: "Fabric",
      fabricType: "Polyester",
      quality: "Standard",
      location: "Warehouse D",
      swatchDate: "2026-08-06",
      length: "15",
      width: "6",
      unitType: "Meter",
      hours: "2",
      colorName: "Green",
      hexCode: "#00FF00",
      finishType: "Matte",
      gsm: "200",
      approvalStatus: "Approved",
      remarks: "Standard green polyester",
    },
  ];

  // Keep a counter per client for swatchCode sequence
  const clientCounters: Record<string, number> = {};

  await db.transaction(async (tx) => {
    let insertedCount = 0;

    for (const data of swatchData) {
      const clientCode = data.clientCode;
      const brandName = clientMap[clientCode];
      if (!brandName) {
        console.warn(`[swatch-seed] Client ${clientCode} not found, skipping swatch "${data.swatchName}"`);
        continue;
      }

      // Increment counter for this client to generate unique swatchCode
      if (!clientCounters[clientCode]) clientCounters[clientCode] = 0;
      clientCounters[clientCode] += 1;
      const seq = String(clientCounters[clientCode]).padStart(3, "0");
      const swatchCode = `${clientCode}-SW${seq}`;

      // Build fabric string: "Cotton – Premium"
      const fabricDisplay = `${data.fabricType} – ${data.quality}`;

      // Generate tags: from fabricType, quality, and a combined tag from swatchName (remove spaces)
      const tags = [
        data.fabricType,
        data.quality,
        data.swatchName.replace(/\s/g, ""),
      ].filter(tag => tag.length > 0);

      // Prepare swatch record (without tags, which go to entityTagsTable)
      const swatchRecord = {
        swatchCode,
        swatchName: data.swatchName,
        client: brandName,
        swatchCategory: data.swatchCategory,
        fabric: fabricDisplay,
        location: data.location,
        swatchDate: data.swatchDate,
        length: data.length,
        width: data.width,
        unitType: data.unitType,
        hours: data.hours,
        attachments: [],
        colorName: data.colorName,
        hexCode: data.hexCode,
        finishType: data.finishType,
        gsm: data.gsm,
        wipMedia: [
          {
            url: `/uploads/swatches/${swatchCode}/wip/sample_wip_1.webp`,
            name: "sample_wip_1.webp",
            type: "image",
          },
          {
            url: `/uploads/swatches/${swatchCode}/wip/sample_wip_2.webp`,
            name: "sample_wip_2.webp",
            type: "image",
          },
        ],
        finalMedia: [
          {
            url: `/uploads/swatches/${swatchCode}/final/sample_final_1.webp`,
            name: "sample_final_1.webp",
            type: "image",
          },
        ],
        approvalStatus: data.approvalStatus,
        remarks: data.remarks,
        createdBy: "system",
      };

      // Insert or update swatch
      const [inserted] = await tx
        .insert(swatchesTable)
        .values(swatchRecord)
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
            // attachments: sql`excluded.attachments`,   // preserve
            colorName: sql`excluded.color_name`,
            hexCode: sql`excluded.hex_code`,
            finishType: sql`excluded.finish_type`,
            gsm: sql`excluded.gsm`,
            // wipMedia: sql`excluded.wip_media`,         // preserve
            // finalMedia: sql`excluded.final_media`,     // preserve
            approvalStatus: sql`excluded.approval_status`,
            remarks: sql`excluded.remarks`,
            updatedBy: sql`excluded.created_by`,
            updatedAt: sql`now()`,
          },
        })
        .returning({ id: swatchesTable.id });

      if (inserted) {
        insertedCount++;

        // Insert tags into entityTagsTable
        for (const tag of tags) {
          await tx
            .insert(entityTagsTable)
            .values({
              entityType: "swatch_master",
              entityId: inserted.id,
              tag,
            })
            .onConflictDoNothing(); // skip duplicates
        }
      }
    }

    console.log(`[master-seed] Swatches: ${insertedCount} inserted/updated with tags`);
  });
}