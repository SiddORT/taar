import { db, styleCategoriesTable } from "@workspace/db";

export async function seedStyleCategories(): Promise<void> {
  const result = await db
    .insert(styleCategoriesTable)
    .values([
      { categoryName: "Gown", createdBy: "system" },
      { categoryName: "Saree", createdBy: "system" },
      { categoryName: "Lehenga", createdBy: "system" },
      { categoryName: "Co-ord Set", createdBy: "system" },
      { categoryName: "Formal Wear", createdBy: "system" },
      { categoryName: "Jacket", createdBy: "system" },
      { categoryName: "Dress", createdBy: "system" },
      { categoryName: "Ethnic Wear", createdBy: "system" },
    ])
    .onConflictDoNothing()
    .returning({ id: styleCategoriesTable.id });

  console.log(`[master-seed] Style categories: ${result.length} inserted`);
}