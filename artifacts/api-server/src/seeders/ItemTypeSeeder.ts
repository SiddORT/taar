import { db, itemTypesTable } from "@workspace/db";

export async function seedItemTypes(): Promise<void> {
  const result = await db
    .insert(itemTypesTable)
    .values([
      { name: "Furniture" },
      { name: "Raw Material" },
      { name: "Accessory" },
      { name: "Packaging" },
      { name: "Label" },
      { name: "Embellishment" },
      { name: "Thread" },
      { name: "Office Supply" },
      { name: "Chemical" },
    ])
    .onConflictDoNothing()
    .returning({
      id: itemTypesTable.id,
    });

  console.log(`[master-seed] Item types: ${result.length} inserted`);
}