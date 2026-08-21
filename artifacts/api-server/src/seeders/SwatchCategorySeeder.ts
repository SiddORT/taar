import { db, swatchCategoriesTable } from "@workspace/db";

export async function seedSwatchCategories(): Promise<void> {
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