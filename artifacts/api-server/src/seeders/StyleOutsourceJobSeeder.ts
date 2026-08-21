import { db, eq, and, sql, inArray } from "@workspace/db";
import { faker } from "@faker-js/faker";
import {
  outsourceJobsTable,
  styleOrdersTable,
  styleOrderProductsTable,
  vendorsTable,
  hsnTable,
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

function randomDate(start: Date, end: Date): string {
  const date = faker.date.between({ from: start, to: end });
  return date.toISOString().slice(0, 10);
}

function getRandomTotalCost(): string {
  const cost = faker.number.float({ min: 100, max: 50000, fractionDigits: 2 });
  return cost.toFixed(2);
}

// ============================================
// Main Seed Function
// ============================================

export async function seedStyleOutsourceJobs(count: number = 0): Promise<void> {
  console.log(`\n🔧 Starting StyleOutsourceJobSeeder...`);

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

  // 2. Fetch style order products (to optionally link)
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

  const productsByOrder: Record<number, typeof products> = {};
  for (const p of products) {
    if (!productsByOrder[p.styleOrderId]) productsByOrder[p.styleOrderId] = [];
    productsByOrder[p.styleOrderId].push(p);
  }

  console.log(`   ✅ Found ${products.length} style order products`);

  // 3. Fetch vendors
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

  // 4. Fetch HSN entries
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

  // 5. Fetch users for createdBy
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

  // 6. Determine how many orders to process
  let ordersToProcess = styleOrders;
  if (count > 0 && count < styleOrders.length) {
    const shuffled = faker.helpers.shuffle(styleOrders);
    ordersToProcess = shuffled.slice(0, count);
    console.log(`   🔀 Processing a random subset of ${count} orders out of ${styleOrders.length}`);
  } else {
    console.log(`   📋 Processing all ${styleOrders.length} orders`);
  }

  let totalJobs = 0;
  let failed = 0;

  // 7. For each order, generate 0-2 outsource jobs (but with 60% chance of at least 1)
  for (const order of ordersToProcess) {
    // Optionally link to a product (60% chance if products exist)
    const orderProducts = productsByOrder[order.id] || [];
    let linkedProduct = null;
    if (orderProducts.length > 0 && faker.datatype.boolean({ probability: 0.6 })) {
      linkedProduct = faker.helpers.arrayElement(orderProducts);
    }

    // Determine how many jobs for this order (0-2, but with bias toward 1)
    const numJobs = faker.number.int({ min: 0, max: 2 });

    for (let i = 0; i < numJobs; i++) {
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
          swatchOrderId: null,                    // style only
          styleOrderId: order.id,
          styleOrderProductId: linkedProduct?.id ?? null,
          styleOrderProductName: linkedProduct?.productName ?? null,
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

    if (ordersToProcess.indexOf(order) % 10 === 0) {
      console.log(`   📊 Processed ${ordersToProcess.indexOf(order) + 1}/${ordersToProcess.length} orders`);
    }
  }

  console.log(`\n✅ StyleOutsourceJobSeeder completed! Created ${totalJobs} outsource jobs, failed ${failed}.`);
}

// ============================================
// Self-execution for ESM
// ============================================

const isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  const count = parseInt(process.argv[2]) || 0;
  seedStyleOutsourceJobs(count).catch(console.error);
}