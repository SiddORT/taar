import { db, eq, and, sql, inArray } from "@workspace/db";
import { faker } from "@faker-js/faker";
import {
  artisanTimesheetsTable,
  styleOrdersTable,
  styleOrderProductsTable,
  usersTable,
} from "@workspace/db";

// ============================================
// Types
// ============================================

interface StyleOrder {
  id: number;
  orderCode: string | null;
  styleName: string | null;
}

interface StyleOrderProduct {
  id: number;
  styleOrderId: number;
  productName: string | null;
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

export async function seedStyleArtisanTimesheets(count: number = 0): Promise<void> {
  console.log(`\n👷 Starting StyleArtisanTimesheetSeeder...`);

  // 1. Fetch style orders (non-deleted)
  const styleOrders = await db
    .select({
      id: styleOrdersTable.id,
      orderCode: styleOrdersTable.orderCode,
      styleName: styleOrdersTable.styleName,
    })
    .from(styleOrdersTable)
    .where(eq(styleOrdersTable.isDeleted, false));

  console.log(`   ✅ Found ${styleOrders.length} style orders`);

  if (styleOrders.length === 0) {
    console.warn('⚠️ No style orders found. Please run StyleOrderSeeder first.');
    return;
  }

  // 2. Fetch style order products for these orders (to optionally link)
  const orderIds = styleOrders.map(o => o.id);
const products = await db
  .select({
    id: styleOrderProductsTable.id,
    styleOrderId: styleOrderProductsTable.styleOrderId,
    productName: styleOrderProductsTable.productName,
  })
  .from(styleOrderProductsTable)
  .where(and(
    eq(styleOrderProductsTable.isDeleted, false),
    inArray(styleOrderProductsTable.styleOrderId, orderIds)
  ));


  // Group products by styleOrderId
  const productsByOrder: Record<number, typeof products> = {};
  for (const p of products) {
    if (!productsByOrder[p.styleOrderId]) productsByOrder[p.styleOrderId] = [];
    productsByOrder[p.styleOrderId].push(p);
  }

  console.log(`   ✅ Found ${products.length} style order products`);

  // 3. Fetch users for createdBy
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

  // 4. Determine how many orders to process
  let ordersToProcess = styleOrders;
  if (count > 0 && count < styleOrders.length) {
    const shuffled = faker.helpers.shuffle(styleOrders);
    ordersToProcess = shuffled.slice(0, count);
    console.log(`   🔀 Processing a random subset of ${count} orders out of ${styleOrders.length}`);
  } else {
    console.log(`   📋 Processing all ${styleOrders.length} orders`);
  }

  let totalTimesheets = 0;
  let failed = 0;

  // 5. For each order, generate 1-3 timesheets
  for (const order of ordersToProcess) {
    const numTimesheets = faker.number.int({ min: 1, max: 3 });

    // Generate a random date range for this order (within the last 60 days)
    const endDate = faker.date.recent({ days: 30 });
    const startDate = faker.date.between({
      from: new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      to: endDate,
    });

    // Get products for this order
    const orderProducts = productsByOrder[order.id] || [];

    for (let i = 0; i < numTimesheets; i++) {
      // Optionally link to a product (60% chance if products exist)
      let linkedProduct = null;
      if (orderProducts.length > 0 && faker.datatype.boolean({ probability: 0.6 })) {
        linkedProduct = faker.helpers.arrayElement(orderProducts);
      }

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

      let createdBy = 'system@erp.com';
      if (users.length > 0) {
        createdBy = faker.helpers.arrayElement(users).email;
      }

      try {
        await db.insert(artisanTimesheetsTable).values({
          swatchOrderId: null,                      // style only
          styleOrderId: order.id,
          styleOrderProductId: linkedProduct?.id ?? null,
          styleOrderProductName: linkedProduct?.productName ?? null,
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

  console.log(`\n✅ StyleArtisanTimesheetSeeder completed! Created ${totalTimesheets} timesheets, failed ${failed}.`);
}

// ============================================
// Self-execution for ESM
// ============================================

const isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  const count = parseInt(process.argv[2]) || 0;
  seedStyleArtisanTimesheets(count).catch(console.error);
}