import { config } from "dotenv";
config();

import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

// Import all seeders
import { seedItemTypes } from "./ItemTypeSeeder";
import { seedUnitTypes } from "./UnitTypeSeeder";
import { seedDepartments } from "./DepartmentSeeder";
import { seedSwatchCategories } from "./SwatchCategorySeeder";
import { seedWarehouseLocations } from "./WarehouseLocationSeeder";
import { seedHsn } from "./HsnSeeder";
import { seedClients } from "./ClientSeeder";
import { seedVendors } from "./VendorSeeder";
import { seedStyleCategories } from "./StyleCategorySeeder";
import { seedShippingVendors } from "./ShippingVendorSeeder";
import { seedSwatches } from "./SwatchSeeder";
import { seedStyles } from "./StyleSeeder";
import { seedItems } from "./ItemSeeder";
import { seedMaterials } from "./MaterialSeeder";
import { seedFabrics } from "./FabricSeeder";
import {seedSwatchOrders} from "./SwatchOrderSeeder";
import { seedArtworks} from "./ArtworkSeeder";
import { seedSwatchBom } from "./SwatchBomSeeder";
import { seedPurchaseOrders } from "./PurchaseOrderSeeder";
import { seedPurchaseReceipts } from "./PurchaseReceiptSeeder";
import { seedArtisanTimesheets } from "./ArtisanTimesheetSeeder";
import { seedOutsourceJobs } from "./OutsourceJobSeeder";
import { seedCustomCharges } from "./CustomChargeSeeder";
import { seedShippingDetails } from "./ShippingDetailSeeder";
import {seedStyleOrders} from "./StyleOrderSeeder";
import {seedStyleOrderProducts} from "./StyleOrderProductSeeder";
import {seedStyleOrderArtworks} from "./StyleOrderArtworksSeeder";
import {seedStyleBom} from "./StyleBomSeeder";
import {seedStylePurchaseOrders} from "./StylePurchaseOrderSeeder";
import {seedStylePurchaseReceipts} from "./StylePurchaseReceiptSeeder";
import {seedStyleArtisanTimesheets} from "./StyleArtisanTimesheetSeeder";
import {seedStyleOutsourceJobs} from "./StyleOutsourceJobSeeder";
import {seedStyleCustomCharges} from "./StyleCustomChargeSeeder";
import {seedStyleShippingDetails} from "./StyleShippingDetailSeeder";
import {seedVendorChallans} from "./VendorChallanSeeder";
import { seedQuotations } from "./QuotationSeeder";
import {seedPackingLists} from "./PackingListSeeder";
import {seedInvoices} from "./InvoiceSeeder";
import {seedBankAccounts} from "./BankAccountSeeder";
import {seedStockAdjustments} from "./StockAdjustmentsSeeder";
import {seedCreditDebitNotes} from "./CreditDebitNotesSeeders";
import {seedOtherExpenses} from "./OtherExpensesSeeder";
import {seedStockAlertsWithNewRecords} from "./StockAlertsWithNewRecordsSeeder";

type SeederFunction = () => Promise<void>;

const seeders: Record<string, SeederFunction> = {
  BankAccountSeeder:seedBankAccounts,
  ItemTypeSeeder: seedItemTypes,
  UnitTypeSeeder: seedUnitTypes,
  DepartmentSeeder: seedDepartments,
  SwatchCategorySeeder: seedSwatchCategories,
  WarehouseLocationSeeder: seedWarehouseLocations,
  HsnSeeder: seedHsn,
  ClientSeeder: seedClients,
  VendorSeeder: seedVendors,
  StyleCategorySeeder: seedStyleCategories,
  ShippingVendorSeeder: seedShippingVendors,
  SwatchSeeder: seedSwatches,
  StyleSeeder: seedStyles,
  ItemSeeder: seedItems,
  MaterialSeeder: seedMaterials,
  FabricSeeder: seedFabrics,
  SwatchOrderSeeder:seedSwatchOrders,
  ArtworkSeeder:seedArtworks,
  SwatchBomSeeder: seedSwatchBom,
  PurchaseOrderSeeder: seedPurchaseOrders,
  PurchaseReceiptSeeder: seedPurchaseReceipts,
  ArtisanTimesheetSeeder: seedArtisanTimesheets,
  OutsourceJobSeeder: seedOutsourceJobs,
  CustomChargeSeeder: seedCustomCharges,
  ShippingDetailSeeder: seedShippingDetails,
  StyleOrderSeeder:seedStyleOrders,
  StyleOrderProductSeeder:seedStyleOrderProducts,
  StyleOrderArtworksSeeder:seedStyleOrderArtworks,
  StyleBomSeeder:seedStyleBom,
  StylePurchaseOrderSeeder:seedStylePurchaseOrders,
  StylePurchaseReceiptSeeder:seedStylePurchaseReceipts,
  StyleArtisanTimesheetSeeder:seedStyleArtisanTimesheets,
  StyleOutsourceJobSeeder:seedStyleOutsourceJobs,
  StyleCustomChargeSeeder:seedStyleCustomCharges,
  StyleShippingDetailSeeder:seedStyleShippingDetails,
  VendorChallanSeeder:seedVendorChallans,
  QuotationSeeder:seedQuotations,
  PackingListSeeder:seedPackingLists,
  InvoiceSeeder:seedInvoices,
  StockAdjustmentsSeeder:seedStockAdjustments,
  CreditDebitNotesSeeders:seedCreditDebitNotes,
  OtherExpensesSeeder:seedOtherExpenses,
  StockAlertsWithNewRecordsSeeder:seedStockAlertsWithNewRecords,
};

// Order in which seeders must run (respects foreign key dependencies)
const seederOrder: string[] = [
  "BankAccountSeeder",
  "ItemTypeSeeder",
  "UnitTypeSeeder",
  "DepartmentSeeder",
  "SwatchCategorySeeder",
  "WarehouseLocationSeeder",
  "HsnSeeder",
  "ClientSeeder",
  "VendorSeeder",
  "StyleCategorySeeder",
  "ShippingVendorSeeder",
  "MaterialSeeder",    
  "FabricSeeder",      
  "SwatchSeeder",
  "StyleSeeder",
  "ItemSeeder",
  "SwatchOrderSeeder",
  "ArtworkSeeder",
  "SwatchBomSeeder",
  "PurchaseOrderSeeder",
  "PurchaseReceiptSeeder",
  "ArtisanTimesheetSeeder",
  "OutsourceJobSeeder",
  "CustomChargeSeeder",
  "ShippingDetailSeeder",
  "StyleOrderSeeder",
  "StyleOrderProductSeeder",
  "StyleOrderArtworksSeeder",
  "StyleBomSeeder",
  "StylePurchaseOrderSeeder",
  "StylePurchaseReceiptSeeder",
  "StyleArtisanTimesheetSeeder",
  "StyleOutsourceJobSeeder",
  "StyleCustomChargeSeeder",
  "StyleShippingDetailSeeder",
  "VendorChallanSeeder",
  "QuotationSeeder",
  "PackingListSeeder",
  "InvoiceSeeder",
  "StockAdjustmentsSeeder",
  "CreditDebitNotesSeeders",
  "OtherExpensesSeeder",
  "StockAlertsWithNewRecordsSeeder",
];

// If seeding all truncate these manually : material_reservations, inventory_items, swatch_bom
// Mapping: seeder name -> table name(s) it inserts into (for truncation)
const seederTables: Record<string, string[]> = {
  BankAccountSeeder:["bank_accounts"],
  ItemTypeSeeder: ["item_types"],
  UnitTypeSeeder: ["unit_types"],
  DepartmentSeeder: ["departments"],
  SwatchCategorySeeder: ["swatch_categories"],
  WarehouseLocationSeeder: ["warehouse_locations"],
  HsnSeeder: ["hsn_master"],
  ClientSeeder: ["clients", "delivery_addresses"],
  VendorSeeder: ["vendors"],
  StyleCategorySeeder: ["style_categories"],
  ShippingVendorSeeder: ["shipping_vendors"],
  SwatchSeeder: ["swatches"],
  StyleSeeder: ["styles"],
  ItemSeeder: ["items"],
  MaterialSeeder: ["materials"],
  FabricSeeder: ["fabrics"],
  SwatchOrderSeeder : ["swatch_orders"],
  ArtworkSeeder:["artworks"],
  PurchaseOrderSeeder: ["purchase_orders", "purchase_order_items"],
  PurchaseReceiptSeeder: ["purchase_receipts", "purchase_receipt_items", "stock_ledger", "inventory_stock_logs"],
  ArtisanTimesheetSeeder: ["artisan_timesheets"],
  OutsourceJobSeeder: ["outsource_jobs"],
  CustomChargeSeeder: ["custom_charges"],
  ShippingDetailSeeder: ["order_shipping_details"],
  StyleOrderSeeder:["style_orders",],
  StyleOrderProductSeeder:["style_order_products"],
  StyleOrderArtworksSeeder:["style_order_artworks"],
  VendorChallanSeeder:["vendor_challans",],
  QuotationSeeder:["quotations", "quotation_custom_charges", "quotation_designs", "quotation_feedback_logs"],
  PackingListSeeder:["packing_lists", "packing_packages"],
  InvoiceSeeder:["invoices"],
  StockAdjustmentsSeeder:["stock_adjustments"],
  CreditDebitNotesSeeders:["credit_debit_notes"],
  OtherExpensesSeeder:["other_expenses"]
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