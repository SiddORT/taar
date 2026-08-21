import { db, eq, and, sql } from "@workspace/db";
import { faker } from "@faker-js/faker";
import { artisanTimesheetsTable, swatchOrdersTable, usersTable } from "@workspace/db";

// ============================================
// Types
// ============================================

interface SwatchOrder {
  id: number;
  clientName: string | null;
  orderStatus: string;
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
 * Get a random shift type
 */
function getRandomShiftType(): string {
  const shifts = ['regular', 'overtime', 'night', 'weekend', 'holiday'];
  return faker.helpers.arrayElement(shifts);
}

// ============================================
// Main Seed Function
// ============================================

export async function seedArtisanTimesheets(count: number = 0): Promise<void> {
  console.log(`\n👷 Starting ArtisanTimesheetSeeder...`);

  // 1. Fetch swatch orders that are not deleted
  const swatchOrders = await db
    .select({
      id: swatchOrdersTable.id,
      clientName: swatchOrdersTable.clientName,
      orderStatus: swatchOrdersTable.orderStatus,
    })
    .from(swatchOrdersTable)
    .where(eq(swatchOrdersTable.isDeleted, false));

  console.log(`   ✅ Found ${swatchOrders.length} swatch orders`);

  if (swatchOrders.length === 0) {
    console.warn('⚠️ No swatch orders found. Please run SwatchOrderSeeder first.');
    return;
  }

  // 2. Fetch users for createdBy
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

  // 3. Determine how many orders to process
  let ordersToProcess = swatchOrders;
  if (count > 0 && count < swatchOrders.length) {
    const shuffled = faker.helpers.shuffle(swatchOrders);
    ordersToProcess = shuffled.slice(0, count);
    console.log(`   🔀 Processing a random subset of ${count} orders out of ${swatchOrders.length}`);
  } else {
    console.log(`   📋 Processing all ${swatchOrders.length} orders`);
  }

  let totalTimesheets = 0;
  let failed = 0;

  // 4. For each order, generate 1-3 timesheets
  for (const order of ordersToProcess) {
    // Determine how many timesheets for this order (1-3)
    const numTimesheets = faker.number.int({ min: 1, max: 3 });

    // Generate a random date range for this order (within the last 60 days)
    const endDate = faker.date.recent({ days: 30 });
    const startDate = faker.date.between({
      from: new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      to: endDate,
    });

    for (let i = 0; i < numTimesheets; i++) {
      // Generate timesheet data
      const noOfArtisans = faker.number.int({ min: 1, max: 10 });
      const totalHours = faker.number.float({ min: 2, max: 40, fractionDigits: 1 });
      const hourlyRate = faker.number.float({ min: 50, max: 500, fractionDigits: 0 });
      const totalRate = (totalHours * hourlyRate * noOfArtisans).toFixed(2);

      // Generate start and end dates within the order's range
      const tsStartDateStr = randomDate(startDate, endDate);
      const startDateObj = new Date(tsStartDateStr);
      const tsEndDateStr = randomDate(
        startDateObj,
        new Date(startDateObj.getTime() + 5 * 24 * 60 * 60 * 1000)
      );

      const shiftType = getRandomShiftType();
      const notes = faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || null;

      // Get a random user email for createdBy
      let createdBy = 'system@erp.com';
      if (users.length > 0) {
        createdBy = faker.helpers.arrayElement(users).email;
      }

      try {
        await db.insert(artisanTimesheetsTable).values({
          swatchOrderId: order.id,
          styleOrderId: null,
          styleOrderProductId: null,
          styleOrderProductName: null,
          noOfArtisans: noOfArtisans,
          startDate: tsStartDateStr,
          endDate: tsEndDateStr,
          shiftType: shiftType,
          totalHours: totalHours.toFixed(1),
          hourlyRate: hourlyRate.toFixed(0),
          totalRate: totalRate,
          notes: notes,
          createdBy: createdBy,
          createdAt: new Date(),
          isDeleted: false,
          deletedBy: null,
          deletedAt: null,
        });

        totalTimesheets++;
      } catch (error) {
        console.error(`  ❌ Failed to create timesheet for order ${order.id}:`, error);
        failed++;
      }
    }

    // Log progress every 10 orders
    if (ordersToProcess.indexOf(order) % 10 === 0) {
      console.log(`   📊 Processed ${ordersToProcess.indexOf(order) + 1}/${ordersToProcess.length} orders`);
    }
  }

  console.log(`\n✅ ArtisanTimesheetSeeder completed! Created ${totalTimesheets} timesheets, failed ${failed}.`);
}

// ============================================
// Self-execution for ESM
// ============================================

var isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  var count = parseInt(process.argv[2]) || 0;
  seedArtisanTimesheets(count).catch(console.error);
}