import { db, eq, and, sql } from "@workspace/db";
import { faker } from "@faker-js/faker";
import { customChargesTable, swatchOrdersTable, vendorsTable, hsnTable, usersTable } from "@workspace/db";

// ============================================
// Types
// ============================================

interface SwatchOrder {
  id: number;
  clientName: string | null;
  orderStatus: string;
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
 * Get a random custom charge description
 */
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

/**
 * Get a random unit price between 50 and 5000
 */
function getRandomUnitPrice(): number {
  return faker.number.float({ min: 50, max: 5000, fractionDigits: 0 });
}

/**
 * Get a random quantity between 1 and 100
 */
function getRandomQuantity(): number {
  return faker.number.int({ min: 1, max: 100 });
}

// ============================================
// Main Seed Function
// ============================================

export async function seedCustomCharges(count: number = 0): Promise<void> {
  console.log(`\n💰 Starting CustomChargeSeeder...`);

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

  // 2. Fetch vendors
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

  // 3. Fetch HSN codes
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

  let totalCharges = 0;
  let failed = 0;

  // 6. For each order, generate 1-3 custom charges
  for (const order of ordersToProcess) {
    // Determine how many charges for this order (1-3)
    const numCharges = faker.number.int({ min: 1, max: 3 });

    // Pick a random vendor for this order
    const vendor = faker.helpers.arrayElement(vendors);
    const hsn = faker.helpers.arrayElement(hsnCodes);

    for (let i = 0; i < numCharges; i++) {
      // Generate charge data
      const description = getRandomDescription();
      const unitPrice = getRandomUnitPrice();
      const quantity = getRandomQuantity();
      const totalAmount = (unitPrice * quantity).toFixed(2);

      // Get a random user email for createdBy
      let createdBy = 'system@erp.com';
      if (users.length > 0) {
        createdBy = faker.helpers.arrayElement(users).email;
      }

      try {
        await db.insert(customChargesTable).values({
          swatchOrderId: order.id,
          styleOrderId: null,
          styleOrderProductId: null,
          styleOrderProductName: null,
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

    // Log progress every 10 orders
    if (ordersToProcess.indexOf(order) % 10 === 0) {
      console.log(`   📊 Processed ${ordersToProcess.indexOf(order) + 1}/${ordersToProcess.length} orders`);
    }
  }

  console.log(`\n✅ CustomChargeSeeder completed! Created ${totalCharges} custom charges, failed ${failed}.`);
}

// ============================================
// Self-execution for ESM
// ============================================

var isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  var count = parseInt(process.argv[2]) || 0;
  seedCustomCharges(count).catch(console.error);
}