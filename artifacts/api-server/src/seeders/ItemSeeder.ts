import {
  db,
  itemsTable,
  itemTypesTable,
  unitTypesTable,
  hsnTable,
  eq,
  and,
} from "@workspace/db";

export async function seedItems(): Promise<void> {
  // ============================================================
  // FETCH ITEM TYPES
  // ============================================================

  const itemTypes = await db
    .select({
      id: itemTypesTable.id,
      name: itemTypesTable.name,
    })
    .from(itemTypesTable)
    .where(
      and(
        eq(itemTypesTable.isActive, true),
        eq(itemTypesTable.isDeleted, false),
      ),
    );

  if (itemTypes.length === 0) {
    throw new Error(
      "[master-seed] Cannot seed items: no active item types found.",
    );
  }

  const itemTypeMap = new Map(
    itemTypes.map((itemType) => [itemType.name.toLowerCase(), itemType.name]),
  );

  const packagingType = itemTypeMap.get("packaging");

  if (!packagingType) {
    throw new Error(
      '[master-seed] Cannot seed items: "Packaging" item type was not found.',
    );
  }

  const rawMaterialType = itemTypeMap.get("raw material");

  if (!rawMaterialType) {
    throw new Error(
      '[master-seed] Cannot seed items: "Raw Material" item type was not found.',
    );
  }

  // Optional item types.
  const accessoryType = itemTypeMap.get("accessory");
  const labelType = itemTypeMap.get("label");
  const embellishmentType = itemTypeMap.get("embellishment");
  const threadType = itemTypeMap.get("thread");
  const furnitureType = itemTypeMap.get("furniture");
  const officeSupplyType = itemTypeMap.get("office supply");
  const chemicalType = itemTypeMap.get("chemical");

  // ============================================================
  // FETCH UNIT TYPES
  // ============================================================

  const unitTypes = await db
    .select({
      id: unitTypesTable.id,
      name: unitTypesTable.name,
    })
    .from(unitTypesTable)
    .where(
      and(
        eq(unitTypesTable.isActive, true),
        eq(unitTypesTable.isDeleted, false),
      ),
    );

  if (unitTypes.length === 0) {
    throw new Error(
      "[master-seed] Cannot seed items: no active unit types found.",
    );
  }

  const unitTypeMap = new Map(
    unitTypes.map((unitType) => [unitType.name.toLowerCase(), unitType.name]),
  );

  const getUnit = (name: string, fallback = "piece") => {
    return (
      unitTypeMap.get(name.toLowerCase()) ??
      unitTypeMap.get(fallback.toLowerCase())
    );
  };

  const pieceUnit = getUnit("piece");

  if (!pieceUnit) {
    throw new Error(
      '[master-seed] Cannot seed items: "Piece" unit type was not found.',
    );
  }

  const meterUnit = getUnit("meter", "piece")!;
  const rollUnit = getUnit("roll", "piece")!;
  const kilogramUnit = getUnit("kilogram", "piece")!;
  const gramUnit = getUnit("gram", "piece")!;
  const boxUnit = getUnit("box", "piece")!;
  const pairUnit = getUnit("pair", "piece")!;
  const setUnit = getUnit("set", "piece")!;
  const dozenUnit = getUnit("dozen", "piece")!;

  // ============================================================
  // FETCH HSN CODES
  // ============================================================

  const hsnCodes = await db
    .select({
      id: hsnTable.id,
      hsnCode: hsnTable.hsnCode,
      gstPercentage: hsnTable.gstPercentage,
    })
    .from(hsnTable)
    .where(eq(hsnTable.isDeleted, false));

  if (hsnCodes.length === 0) {
    throw new Error("[master-seed] Cannot seed items: no HSN codes found.");
  }

  // ============================================================
  // HSN HELPER
  // ============================================================

  const getHsn = (index: number) => {
    return hsnCodes[index % hsnCodes.length];
  };

  // ============================================================
  // ITEM FACTORY
  // ============================================================

  const createItem = ({
    itemCode,
    itemName,
    itemType,
    description,
    unitType,
    unitPrice,
    hsnIndex,
  }: {
    itemCode: string;
    itemName: string;
    itemType: string;
    description: string;
    unitType: string;
    unitPrice: string;
    hsnIndex: number;
  }) => {
    const hsn = getHsn(hsnIndex);

    return {
      itemCode,
      itemName,
      itemType,
      description,
      unitType,
      unitPrice,
      hsnCode: hsn.hsnCode,
      gstPercent: hsn.gstPercentage,
      currentStock: "0",
      locationStocks: [],
      images: [],
      reorderLevel: "0",
      minimumLevel: "0",
      maximumLevel: "0",
      createdBy: "system",
    };
  };

  // ============================================================
  // ITEM DATA
  // ============================================================

  const itemData = [
    // ============================================================
    // PACKAGING
    // ============================================================

    createItem({
      itemCode: "ITEM001",
      itemName: "Corrugated Carton",
      itemType: packagingType,
      description:
        "Standard corrugated carton for garment packing and shipment",
      unitType: pieceUnit,
      unitPrice: "45.00",
      hsnIndex: 0,
    }),

    createItem({
      itemCode: "ITEM002",
      itemName: "Poly Bag",
      itemType: packagingType,
      description: "Transparent poly bag for individual garment packing",
      unitType: pieceUnit,
      unitPrice: "3.50",
      hsnIndex: 1,
    }),

    createItem({
      itemCode: "ITEM003",
      itemName: "Bubble Wrap",
      itemType: packagingType,
      description:
        "Protective bubble wrap for packing delicate garments and accessories",
      unitType: rollUnit,
      unitPrice: "320.00",
      hsnIndex: 2,
    }),

    createItem({
      itemCode: "ITEM004",
      itemName: "Tissue Paper",
      itemType: packagingType,
      description:
        "Soft tissue paper used for premium garment presentation and packing",
      unitType: pieceUnit,
      unitPrice: "2.50",
      hsnIndex: 3,
    }),

    createItem({
      itemCode: "ITEM005",
      itemName: "Garment Hanger",
      itemType: packagingType,
      description:
        "Plastic hanger used for storing and displaying finished garments",
      unitType: pieceUnit,
      unitPrice: "18.00",
      hsnIndex: 4,
    }),

    createItem({
      itemCode: "ITEM006",
      itemName: "Packaging Tape",
      itemType: packagingType,
      description: "Adhesive packaging tape used for sealing cartons",
      unitType: rollUnit,
      unitPrice: "85.00",
      hsnIndex: 5,
    }),

    createItem({
      itemCode: "ITEM007",
      itemName: "Carton Divider",
      itemType: packagingType,
      description: "Cardboard divider used to separate garments inside cartons",
      unitType: pieceUnit,
      unitPrice: "8.00",
      hsnIndex: 6,
    }),

    // ============================================================
    // RAW MATERIAL
    // ============================================================

    createItem({
      itemCode: "ITEM008",
      itemName: "Cotton Fabric",
      itemType: rawMaterialType,
      description: "Cotton fabric used for garment manufacturing",
      unitType: meterUnit,
      unitPrice: "185.00",
      hsnIndex: 7,
    }),

    createItem({
      itemCode: "ITEM009",
      itemName: "Polyester Fabric",
      itemType: rawMaterialType,
      description: "Polyester fabric used for dresses and fashion garments",
      unitType: meterUnit,
      unitPrice: "145.00",
      hsnIndex: 8,
    }),

    createItem({
      itemCode: "ITEM010",
      itemName: "Silk Fabric",
      itemType: rawMaterialType,
      description: "Silk fabric used for premium ethnic and occasion wear",
      unitType: meterUnit,
      unitPrice: "650.00",
      hsnIndex: 9,
    }),

    createItem({
      itemCode: "ITEM011",
      itemName: "Cotton Lining Fabric",
      itemType: rawMaterialType,
      description: "Cotton lining material used inside garments",
      unitType: meterUnit,
      unitPrice: "95.00",
      hsnIndex: 10,
    }),

    createItem({
      itemCode: "ITEM012",
      itemName: "Interlining Material",
      itemType: rawMaterialType,
      description:
        "Interlining material used for garment structure and support",
      unitType: meterUnit,
      unitPrice: "55.00",
      hsnIndex: 11,
    }),

    // ============================================================
    // ACCESSORY
    // ============================================================

    ...(accessoryType
      ? [
          createItem({
            itemCode: "ITEM013",
            itemName: "Metal Zipper",
            itemType: accessoryType,
            description: "Metal zipper used for garment closures",
            unitType: pieceUnit,
            unitPrice: "12.00",
            hsnIndex: 12,
          }),

          createItem({
            itemCode: "ITEM014",
            itemName: "Plastic Button",
            itemType: accessoryType,
            description: "Plastic button used for shirts, kurtas and dresses",
            unitType: dozenUnit,
            unitPrice: "24.00",
            hsnIndex: 13,
          }),

          createItem({
            itemCode: "ITEM015",
            itemName: "Metal Hook",
            itemType: accessoryType,
            description: "Metal hook and eye fastening for garments",
            unitType: dozenUnit,
            unitPrice: "18.00",
            hsnIndex: 14,
          }),

          createItem({
            itemCode: "ITEM016",
            itemName: "Elastic Tape",
            itemType: accessoryType,
            description: "Elastic tape used for waistbands and garment fitting",
            unitType: rollUnit,
            unitPrice: "180.00",
            hsnIndex: 15,
          }),

          createItem({
            itemCode: "ITEM017",
            itemName: "Shoulder Pad",
            itemType: accessoryType,
            description:
              "Shoulder pad used for structured garments and jackets",
            unitType: pairUnit,
            unitPrice: "35.00",
            hsnIndex: 16,
          }),
        ]
      : []),

    // ============================================================
    // LABEL
    // ============================================================

    ...(labelType
      ? [
          createItem({
            itemCode: "ITEM018",
            itemName: "Brand Label",
            itemType: labelType,
            description: "Woven brand label attached to finished garments",
            unitType: pieceUnit,
            unitPrice: "2.50",
            hsnIndex: 17,
          }),

          createItem({
            itemCode: "ITEM019",
            itemName: "Wash Care Label",
            itemType: labelType,
            description: "Printed wash care and garment composition label",
            unitType: pieceUnit,
            unitPrice: "0.75",
            hsnIndex: 18,
          }),

          createItem({
            itemCode: "ITEM020",
            itemName: "Size Label",
            itemType: labelType,
            description: "Garment size identification label",
            unitType: pieceUnit,
            unitPrice: "0.50",
            hsnIndex: 19,
          }),
        ]
      : []),

    // ============================================================
    // EMBELLISHMENT
    // ============================================================

    ...(embellishmentType
      ? [
          createItem({
            itemCode: "ITEM021",
            itemName: "Decorative Sequins",
            itemType: embellishmentType,
            description: "Decorative sequins used for garment embellishment",
            unitType: gramUnit,
            unitPrice: "1.80",
            hsnIndex: 20,
          }),

          createItem({
            itemCode: "ITEM022",
            itemName: "Embroidery Beads",
            itemType: embellishmentType,
            description:
              "Decorative beads used for embroidery and surface ornamentation",
            unitType: gramUnit,
            unitPrice: "4.50",
            hsnIndex: 21,
          }),

          createItem({
            itemCode: "ITEM023",
            itemName: "Decorative Lace",
            itemType: embellishmentType,
            description:
              "Decorative lace used for garment finishing and ornamentation",
            unitType: meterUnit,
            unitPrice: "85.00",
            hsnIndex: 22,
          }),

          createItem({
            itemCode: "ITEM024",
            itemName: "Rhinestone",
            itemType: embellishmentType,
            description:
              "Decorative rhinestones used for premium garment detailing",
            unitType: gramUnit,
            unitPrice: "8.00",
            hsnIndex: 23,
          }),
        ]
      : []),

    // ============================================================
    // THREAD
    // ============================================================

    ...(threadType
      ? [
          createItem({
            itemCode: "ITEM025",
            itemName: "Polyester Sewing Thread",
            itemType: threadType,
            description:
              "Polyester sewing thread for general garment stitching",
            unitType: rollUnit,
            unitPrice: "95.00",
            hsnIndex: 24,
          }),

          createItem({
            itemCode: "ITEM026",
            itemName: "Embroidery Thread",
            itemType: threadType,
            description:
              "Embroidery thread used for decorative machine embroidery",
            unitType: rollUnit,
            unitPrice: "125.00",
            hsnIndex: 25,
          }),

          createItem({
            itemCode: "ITEM027",
            itemName: "Cotton Sewing Thread",
            itemType: threadType,
            description: "Cotton sewing thread for garment stitching",
            unitType: rollUnit,
            unitPrice: "75.00",
            hsnIndex: 26,
          }),
        ]
      : []),

    // ============================================================
    // FURNITURE
    // ============================================================

    ...(furnitureType
      ? [
          createItem({
            itemCode: "ITEM028",
            itemName: "Office Chair",
            itemType: furnitureType,
            description: "Ergonomic chair for office and administrative use",
            unitType: pieceUnit,
            unitPrice: "4500.00",
            hsnIndex: 27,
          }),

          createItem({
            itemCode: "ITEM029",
            itemName: "Work Table",
            itemType: furnitureType,
            description:
              "Work table used for garment inspection and office operations",
            unitType: pieceUnit,
            unitPrice: "7500.00",
            hsnIndex: 28,
          }),

          createItem({
            itemCode: "ITEM030",
            itemName: "Storage Rack",
            itemType: furnitureType,
            description:
              "Metal storage rack for inventory and material storage",
            unitType: pieceUnit,
            unitPrice: "6500.00",
            hsnIndex: 29,
          }),
        ]
      : []),

    // ============================================================
    // OFFICE SUPPLY
    // ============================================================

    ...(officeSupplyType
      ? [
          createItem({
            itemCode: "ITEM031",
            itemName: "A4 Copier Paper",
            itemType: officeSupplyType,
            description: "A4 size copier paper for office documentation",
            unitType: boxUnit,
            unitPrice: "320.00",
            hsnIndex: 30,
          }),

          createItem({
            itemCode: "ITEM032",
            itemName: "Permanent Marker",
            itemType: officeSupplyType,
            description:
              "Permanent marker used for inventory and production identification",
            unitType: pieceUnit,
            unitPrice: "25.00",
            hsnIndex: 31,
          }),

          createItem({
            itemCode: "ITEM033",
            itemName: "Paper File Folder",
            itemType: officeSupplyType,
            description:
              "File folder used for storing business and production documents",
            unitType: pieceUnit,
            unitPrice: "15.00",
            hsnIndex: 32,
          }),
        ]
      : []),

    // ============================================================
    // CHEMICAL
    // ============================================================

    ...(chemicalType
      ? [
          createItem({
            itemCode: "ITEM034",
            itemName: "Fabric Processing Chemical",
            itemType: chemicalType,
            description:
              "Chemical used during fabric processing and garment production",
            unitType: kilogramUnit,
            unitPrice: "180.00",
            hsnIndex: 33,
          }),

          createItem({
            itemCode: "ITEM035",
            itemName: "Fabric Softener",
            itemType: chemicalType,
            description: "Chemical softener used during textile finishing",
            unitType: kilogramUnit,
            unitPrice: "220.00",
            hsnIndex: 34,
          }),

          createItem({
            itemCode: "ITEM036",
            itemName: "Garment Stain Remover",
            itemType: chemicalType,
            description:
              "Cleaning chemical used for removing stains from garments",
            unitType: kilogramUnit,
            unitPrice: "280.00",
            hsnIndex: 35,
          }),
        ]
      : []),
  ];

  // ============================================================
  // INSERT ITEMS
  // ============================================================

  const result = await db
    .insert(itemsTable)
    .values(itemData)
    .onConflictDoNothing()
    .returning({
      id: itemsTable.id,
      itemCode: itemsTable.itemCode,
    });

  console.log(`[master-seed] Items: ${result.length} inserted`);
}
