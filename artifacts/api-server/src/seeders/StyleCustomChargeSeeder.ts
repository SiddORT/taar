import { db, eq, and, sql, inArray } from "@workspace/db";
import { faker } from "@faker-js/faker";
import {
  customChargesTable,
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

function getRandomDescription(): string {
  const descriptions = [
    'Design Consultation',
    'Fabric Sourcing Fee',
    'Sample Development Charge',
    'Embroidery Design Fee',
    'Printing Setup Cost',
    'Pattern Making Charge',
    'Grading Fee',
    'Fitting Session Charge',
    'Quality Inspection Fee',
    'Packaging Design Charge',
    'Logistics Coordination Fee',
    'Custom Dyeing Service',
    'Finishing Charge',
    'Trims Sourcing Fee',
    'Tech Pack Development',
    'Size Set Development',
    'Proto Sample Charge',
    'Photo Shoot Arrangement',
    'Marketing Material Design',
    'Client Meeting Travel Cost',
  ];
  return faker.helpers.arrayElement(descriptions);
}

function getRandomUnitPrice(): number {
  return faker.number.float({ min: 50, max: 5000, fractionDigits: 0 });
}

function getRandomQuantity(): number {
  return faker.number.int({ min: 1, max: 100 });
}

// ============================================
// Main Seed Function
// ============================================

export async function seedStyleCustomCharges(count: number = 0): Promise<void> {
  console.log(`\n💰 Starting StyleCustomChargeSeeder...`);

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

  // 4. Fetch HSN codes
  const hsnCodes = await db
    .select({
      id: hsnTable.id,
      hsnCode: hsnTable.hsnCode,
      gstPercentage: hsnTable.gstPercentage,
    })
    .from(hsnTable)
    .where(eq(hsnTable.isDeleted, false));

  console.log(`   ✅ Found ${hsnCodes.length} HSN codes`);

  if (hsnCodes.length === 0) {
    console.warn('⚠️ No HSN codes found. Please run HsnSeeder first.');
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

  let totalCharges = 0;
  let failed = 0;

  // 7. For each order, generate 1-3 custom charges
  for (const order of ordersToProcess) {
    // Optionally link to a product (60% chance if products exist)
    const orderProducts = productsByOrder[order.id] || [];
    let linkedProduct = null;
    if (orderProducts.length > 0 && faker.datatype.boolean({ probability: 0.6 })) {
      linkedProduct = faker.helpers.arrayElement(orderProducts);
    }

    // Determine how many charges for this order (1-3)
    const numCharges = faker.number.int({ min: 1, max: 3 });

    // Pick a random vendor and HSN for this order (or you could vary per charge)
    const vendor = faker.helpers.arrayElement(vendors);
    const hsn = faker.helpers.arrayElement(hsnCodes);

    for (let i = 0; i < numCharges; i++) {
      const description = getRandomDescription();
      const unitPrice = getRandomUnitPrice();
      const quantity = getRandomQuantity();
      const totalAmount = (unitPrice * quantity).toFixed(2);

      let createdBy = 'system@erp.com';
      if (users.length > 0) {
        createdBy = faker.helpers.arrayElement(users).email;
      }

      try {
        await db.insert(customChargesTable).values({
          swatchOrderId: null,                    // style only
          styleOrderId: order.id,
          styleOrderProductId: linkedProduct?.id ?? null,
          styleOrderProductName: linkedProduct?.productName ?? null,
          vendorId: vendor.id,
          vendorName: vendor.brandName,
          hsnId: hsn.id,
          hsnCode: hsn.hsnCode,
          gstPercentage: hsn.gstPercentage || '5',
          description: description,
          unitPrice: unitPrice.toFixed(2),
          quantity: quantity.toString(),
          totalAmount: totalAmount,
          createdBy: createdBy,
          createdAt: new Date(),
          isDeleted: false,
          deletedBy: null,
          deletedAt: null,
        });

        totalCharges++;
      } catch (error) {
        console.error(`  ❌ Failed to create custom charge for order ${order.id}:`, error);
        failed++;
      }
    }

    if (ordersToProcess.indexOf(order) % 10 === 0) {
      console.log(`   📊 Processed ${ordersToProcess.indexOf(order) + 1}/${ordersToProcess.length} orders`);
    }
  }

  console.log(`\n✅ StyleCustomChargeSeeder completed! Created ${totalCharges} custom charges, failed ${failed}.`);
}

// ============================================
// Self-execution for ESM
// ============================================

const isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  const count = parseInt(process.argv[2]) || 0;
  seedStyleCustomCharges(count).catch(console.error);
}