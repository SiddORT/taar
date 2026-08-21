import { db, unitTypesTable } from "@workspace/db";

export async function seedUnitTypes(): Promise<void> {
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
      { name: "Spools"},
    ])
    .onConflictDoNothing()
    .returning({ id: unitTypesTable.id });

  console.log(`[master-seed] Unit types: ${result.length} inserted`);
}