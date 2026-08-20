import { config } from "dotenv";
config();

import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

// Import all seeders
// import { seedItemTypes } from "./ItemTypeSeeder";
// import { seedUnitTypes } from "./UnitTypeSeeder";
// import { seedDepartments } from "./DepartmentSeeder";
// import { seedSwatchCategories } from "./SwatchCategorySeeder";
// import { seedWarehouseLocations } from "./WarehouseLocationSeeder";
// import { seedHsn } from "./HsnSeeder";
// import { seedClients } from "./ClientSeeder";
// import { seedVendors } from "./VendorSeeder";
// import { seedStyleCategories } from "./StyleCategorySeeder";
// import { seedShippingVendors } from "./ShippingVendorSeeder";
// import { seedSwatches } from "./SwatchSeeder";
// import { seedStyles } from "./StyleSeeder";
// import { seedItems } from "./ItemSeeder";
// Uncomment if you enable materials/fabrics:
// import { seedMaterials } from "./MaterialSeeder";
// import { seedFabrics } from "./FabricSeeder";
import {seedSwatchOrders} from "./SwatchOrderSeeder";
import { seedArtworks} from "./ArtworkSeeder";

type SeederFunction = () => Promise<void>;

const seeders: Record<string, SeederFunction> = {
//   ItemTypeSeeder: seedItemTypes,
//   UnitTypeSeeder: seedUnitTypes,
//   DepartmentSeeder: seedDepartments,
//   SwatchCategorySeeder: seedSwatchCategories,
//   WarehouseLocationSeeder: seedWarehouseLocations,
//   HsnSeeder: seedHsn,
//   ClientSeeder: seedClients,
//   VendorSeeder: seedVendors,
//   StyleCategorySeeder: seedStyleCategories,
//   ShippingVendorSeeder: seedShippingVendors,
//   SwatchSeeder: seedSwatches,
//   StyleSeeder: seedStyles,
//   ItemSeeder: seedItems,
  // MaterialSeeder: seedMaterials,
  // FabricSeeder: seedFabrics,
  SwatchOrderSeeder:seedSwatchOrders,
  ArtworkSeeder:seedArtworks
};

// Order in which seeders must run (respects foreign key dependencies)
const seederOrder: string[] = [
//   "ItemTypeSeeder",
//   "UnitTypeSeeder",
//   "DepartmentSeeder",
//   "SwatchCategorySeeder",
//   "WarehouseLocationSeeder",
//   "HsnSeeder",
//   "ClientSeeder",
//   "VendorSeeder",
//   "StyleCategorySeeder",
//   "ShippingVendorSeeder",
//   // "MaterialSeeder",    // uncomment if needed
//   // "FabricSeeder",      // uncomment if needed
//   "SwatchSeeder",
//   "StyleSeeder",
//   "ItemSeeder",
"SwatchOrderSeeder",
"ArtworkSeeder"
];

// Mapping: seeder name -> table name(s) it inserts into (for truncation)
const seederTables: Record<string, string[]> = {
//   ItemTypeSeeder: ["item_types"],
//   UnitTypeSeeder: ["unit_types"],
//   DepartmentSeeder: ["departments"],
//   SwatchCategorySeeder: ["swatch_categories"],
//   WarehouseLocationSeeder: ["warehouse_locations"],
//   HsnSeeder: ["hsn"],
//   ClientSeeder: ["clients"],
//   VendorSeeder: ["vendors"],
//   StyleCategorySeeder: ["style_categories"],
//   ShippingVendorSeeder: ["shipping_vendors"],
//   SwatchSeeder: ["swatches"],
//   StyleSeeder: ["styles"],
//   ItemSeeder: ["items"],
  // MaterialSeeder: ["materials"],
  // FabricSeeder: ["fabrics"],
  SwatchOrderSeeder : ["swatch_orders"],
  ArtworkSeeder:["artworks"]

};

// All tables for full truncation
const allTables = Object.values(seederTables).flat();

/**
 * Truncate given tables, restart identity, and cascade to handle dependencies.
 */
async function truncateTables(tableNames: string[]): Promise<void> {
  if (tableNames.length === 0) return;
  console.log(`🗑️  Truncating tables: ${tableNames.join(", ")} (RESTART IDENTITY CASCADE)...`);
  const names = tableNames.join(", ");
  await db.execute(sql.raw(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE;`));
  console.log("✅ Truncation complete.");
}

/**
 * Run a specific seeder after truncating only its own tables.
 */
async function runSingleSeeder(name: string): Promise<void> {
  const seeder = seeders[name];
  if (!seeder) {
    throw new Error(`Seeder "${name}" not found.`);
  }

  // Truncate only the tables that this seeder populates
  const tables = seederTables[name];
  if (tables && tables.length > 0) {
    await truncateTables(tables);
  }

  console.log(`🌱 Running ${name}...`);
  await seeder();
  console.log(`✅ ${name} completed.`);
}

/**
 * Run all seeders in order after truncating all tables.
 */
async function runAllSeeders(): Promise<void> {
  // Truncate all tables
  await truncateTables(allTables);

  for (const name of seederOrder) {
    const seeder = seeders[name];
    if (!seeder) {
      throw new Error(`Seeder "${name}" not found.`);
    }
    console.log(`🌱 Running ${name}...`);
    await seeder();
    console.log(`✅ ${name} completed.`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const seederName = args[0];

  try {
    if (seederName) {
      await runSingleSeeder(seederName);
    } else {
      await runAllSeeders();
    }

    console.log("🌱 Seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();