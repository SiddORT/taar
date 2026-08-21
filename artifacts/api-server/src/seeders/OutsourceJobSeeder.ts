import { db, eq, and, sql } from "@workspace/db";
import { faker } from "@faker-js/faker";
import {
  outsourceJobsTable,
  swatchOrdersTable,
  vendorsTable,
  hsnTable,
  usersTable,
} from "@workspace/db";

// ============================================
// Types
// ============================================

interface SwatchOrder {
  id: number;
}

interface Vendor {
  id: number;
  brandName: string;
}

interface Hsn {
  id: number;
  hsnCode: string;
  gstPercentage: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a random date between two dates and return as ISO date string
 */
function randomDate(start: Date, end: Date): string {
  const date = faker.date.between({ from: start, to: end });
  return date.toISOString().slice(0, 10);
}

/**
 * Generate a random total cost
 */
function getRandomTotalCost(): string {
  const cost = faker.number.float({ min: 100, max: 50000, fractionDigits: 2 });
  return cost.toFixed(2);
}

// ============================================
// Main Seed Function
// ============================================

export async function seedOutsourceJobs(count: number = 0): Promise<void> {
  console.log(`\n🔧 Starting OutsourceJobSeeder...`);

  // 1. Fetch swatch orders that are not deleted
  const swatchOrders = await db
    .select({ id: swatchOrdersTable.id })
    .from(swatchOrdersTable)
    .where(eq(swatchOrdersTable.isDeleted, false));

  console.log(`   ✅ Found ${swatchOrders.length} swatch orders`);

  if (swatchOrders.length === 0) {
    console.warn('⚠️ No swatch orders found. Please run SwatchOrderSeeder first.');
    return;
  }

  // 2. Fetch vendors that are not deleted
  const vendors = await db
    .select({
      id: vendorsTable.id,
      brandName: vendorsTable.brandName,
    })
    .from(vendorsTable)
    .where(eq(vendorsTable.isDeleted, false));

  console.log(`   ✅ Found ${vendors.length} vendors`);

  if (vendors.length === 0) {
    console.warn('⚠️ No vendors found. Please run VendorSeeder first.');
    return;
  }

  // 3. Fetch HSN entries that are not deleted
  const hsnEntries = await db
    .select({
      id: hsnTable.id,
      hsnCode: hsnTable.hsnCode,
      gstPercentage: hsnTable.gstPercentage,
    })
    .from(hsnTable)
    .where(eq(hsnTable.isDeleted, false));

  console.log(`   ✅ Found ${hsnEntries.length} HSN entries`);

  if (hsnEntries.length === 0) {
    console.warn('⚠️ No HSN entries found. Please run HsnSeeder first.');
    return;
  }

  // 4. Fetch users for createdBy
  const users = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(and(
      eq(usersTable.isActive, true),
      eq(usersTable.isDeleted, false),
      sql`${usersTable.email} IS NOT NULL AND ${usersTable.email} != ''`
    ));

  console.log(`   ✅ Found ${users.length} active users`);

  if (users.length === 0) {
    console.warn('⚠️ No active users found. Using fallback emails.');
  }

  // 5. Determine how many orders to process
  let ordersToProcess = swatchOrders;
  if (count > 0 && count < swatchOrders.length) {
    const shuffled = faker.helpers.shuffle(swatchOrders);
    ordersToProcess = shuffled.slice(0, count);
    console.log(`   🔀 Processing a random subset of ${count} orders out of ${swatchOrders.length}`);
  } else {
    console.log(`   📋 Processing all ${swatchOrders.length} orders`);
  }

  let totalJobs = 0;
  let failed = 0;

  // 6. For each order, generate 0-2 outsource jobs (but at least 1 if we want to ensure coverage)
  for (const order of ordersToProcess) {
    // Determine how many jobs for this order (0-2, but with 50% chance of at least 1)
    const numJobs = faker.number.int({ min: 0, max: 2 });

    // If we want to ensure each order gets at least one job, uncomment:
    // const numJobs = faker.number.int({ min: 1, max: 2 });

    for (let i = 0; i < numJobs; i++) {
      // Pick random vendor, HSN, and user
      const vendor = faker.helpers.arrayElement(vendors);
      const hsn = faker.helpers.arrayElement(hsnEntries);
      let createdBy = 'system@erp.com';
      if (users.length > 0) {
        createdBy = faker.helpers.arrayElement(users).email;
      }

      // Generate dates
      const issueDate = faker.date.recent({ days: 30 });
      const targetDate = faker.date.future({ years: 1, refDate: issueDate });
      const deliveryDate = faker.date.future({ years: 1, refDate: targetDate });

      const totalCost = getRandomTotalCost();
      const notes = faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || null;

      try {
        await db.insert(outsourceJobsTable).values({
          swatchOrderId: order.id,
          styleOrderId: null,
          styleOrderProductId: null,
          styleOrderProductName: null,
          vendorId: vendor.id,
          vendorName: vendor.brandName,
          hsnId: hsn.id,
          hsnCode: hsn.hsnCode,
          gstPercentage: hsn.gstPercentage,
          issueDate: issueDate.toISOString().slice(0, 10),
          targetDate: targetDate.toISOString().slice(0, 10),
          deliveryDate: deliveryDate.toISOString().slice(0, 10),
          totalCost: totalCost,
          notes: notes,
          createdBy: createdBy,
          createdAt: new Date(),
          isDeleted: false,
          deletedBy: null,
          deletedAt: null,
        });

        totalJobs++;
      } catch (error) {
        console.error(`  ❌ Failed to create outsource job for order ${order.id}:`, error);
        failed++;
      }
    }

    // Log progress every 10 orders
    if (ordersToProcess.indexOf(order) % 10 === 0) {
      console.log(`   📊 Processed ${ordersToProcess.indexOf(order) + 1}/${ordersToProcess.length} orders`);
    }
  }

  console.log(`\n✅ OutsourceJobSeeder completed! Created ${totalJobs} outsource jobs, failed ${failed}.`);
}

// ============================================
// Self-execution for ESM
// ============================================

var isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  var count = parseInt(process.argv[2]) || 0;
  seedOutsourceJobs(count).catch(console.error);
}