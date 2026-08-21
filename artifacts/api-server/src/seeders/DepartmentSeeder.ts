import { db, departmentsTable } from "@workspace/db";

export async function seedDepartments(): Promise<void> {
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