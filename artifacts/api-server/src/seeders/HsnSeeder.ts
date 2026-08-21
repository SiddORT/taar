import { db, hsnTable, eq, and } from "@workspace/db";

export async function seedHsn(): Promise<void> {
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