import { db, eq, and, sql } from "@workspace/db";
import { faker } from "@faker-js/faker";
import {
  orderShippingDetails,
  shippingVendors,
  swatchOrdersTable,
  usersTable,
} from "@workspace/db";

// ============================================
// Types
// ============================================

interface SwatchOrder {
  id: number;
  clientName: string | null;
  orderStatus: string;
}

interface ShippingVendor {
  id: number;
  vendorName: string;
  weightRatePerKg: string;
  minimumCharge: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a random tracking number (12 digits)
 */
function generateTrackingNumber(): string {
  return faker.string.numeric(12);
}

/**
 * Generate a random shipment date (within the last 30 days)
 */
function generateShipmentDate(): string {
  return faker.date.recent({ days: 30 }).toISOString().slice(0, 10);
}

/**
 * Generate a random expected delivery date (3-10 days after shipment)
 */
function generateExpectedDeliveryDate(shipmentDate: string): string {
  const date = new Date(shipmentDate);
  date.setDate(date.getDate() + faker.number.int({ min: 3, max: 10 }));
  return date.toISOString().slice(0, 10);
}

/**
 * Generate a random actual delivery date (2-5 days after expected, or null if not delivered)
 */
function generateActualDeliveryDate(expectedDate: string, status: string): string | null {
  if (status === 'Delivered') {
    const date = new Date(expectedDate);
    date.setDate(date.getDate() + faker.number.int({ min: 2, max: 5 }));
    return date.toISOString().slice(0, 10);
  }
  return null;
}

/**
 * Get a random shipment status
 */
function getRandomShipmentStatus(): string {
  const statuses = ['Pending', 'In Transit', 'Delivered'];
  return faker.helpers.arrayElement(statuses);
}

/**
 * Calculate shipping amount
 */
function calculateShipping(
  weight: number,
  ratePerKg: number,
  minimumCharge: number
): { calculated: number; final: number } {
  const calculated = weight * ratePerKg;
  const final = Math.max(calculated, minimumCharge);
  return { calculated, final };
}

// ============================================
// Main Seed Function
// ============================================

export async function seedShippingDetails(count: number = 0): Promise<void> {
  console.log(`\n📦 Starting ShippingDetailSeeder...`);

  // 1. Fetch completed swatch orders
  const swatchOrders = await db
    .select({
      id: swatchOrdersTable.id,
      clientName: swatchOrdersTable.clientName,
      orderStatus: swatchOrdersTable.orderStatus,
    })
    .from(swatchOrdersTable)
    .where(and(
      eq(swatchOrdersTable.orderStatus, 'Completed'),
      eq(swatchOrdersTable.isDeleted, false)
    ));

  console.log(`   ✅ Found ${swatchOrders.length} completed swatch orders`);

  if (swatchOrders.length === 0) {
    console.warn('⚠️ No completed swatch orders found. Please run SwatchOrderSeeder first.');
    return;
  }

  // 2. Fetch shipping vendors
  const vendors = await db
    .select({
      id: shippingVendors.id,
      vendorName: shippingVendors.vendorName,
      weightRatePerKg: shippingVendors.weightRatePerKg,
      minimumCharge: shippingVendors.minimumCharge,
    })
    .from(shippingVendors)
    .where(and(
      eq(shippingVendors.isActive, true),
      eq(shippingVendors.isDeleted, false)
    ));

  console.log(`   ✅ Found ${vendors.length} shipping vendors`);

  if (vendors.length === 0) {
    console.warn('⚠️ No shipping vendors found. Please run ShippingVendorSeeder first.');
    return;
  }

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
  let ordersToProcess = swatchOrders;
  if (count > 0 && count < swatchOrders.length) {
    const shuffled = faker.helpers.shuffle(swatchOrders);
    ordersToProcess = shuffled.slice(0, count);
    console.log(`   🔀 Processing a random subset of ${count} orders out of ${swatchOrders.length}`);
  } else {
    console.log(`   📋 Processing all ${swatchOrders.length} orders`);
  }

  let totalShippingDetails = 0;
  let skipped = 0;
  let failed = 0;

  // 5. For each completed order, create shipping details (if not already exists)
  for (const order of ordersToProcess) {
    // Check if shipping details already exist for this order
    const existing = await db
      .select({ id: orderShippingDetails.id })
      .from(orderShippingDetails)
      .where(and(
        eq(orderShippingDetails.referenceType, 'Swatch'),
        eq(orderShippingDetails.referenceId, order.id),
        eq(orderShippingDetails.isDeleted, false)
      ))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ⏭️ Skipping order ${order.id} - shipping details already exist`);
      skipped++;
      continue;
    }

    // Pick a random vendor
    const vendor = faker.helpers.arrayElement(vendors);

    // Generate shipping data
    const weight = faker.number.float({ min: 1, max: 50, fractionDigits: 2 });
    const ratePerKg = parseFloat(vendor.weightRatePerKg || '0');
    const minimumCharge = parseFloat(vendor.minimumCharge || '0');
    const { calculated, final } = calculateShipping(weight, ratePerKg, minimumCharge);

    const status = getRandomShipmentStatus();
    const shipmentDate = generateShipmentDate();
    const expectedDeliveryDate = generateExpectedDeliveryDate(shipmentDate);
    const actualDeliveryDate = generateActualDeliveryDate(expectedDeliveryDate, status);

    const trackingNumber = generateTrackingNumber();
    const trackingUrl = faker.helpers.maybe(() => `https://track.example.com/${trackingNumber}`, { probability: 0.5 }) || null;

    // Get a random user email for createdBy
    let createdBy = 'system@erp.com';
    if (users.length > 0) {
      createdBy = faker.helpers.arrayElement(users).email;
    }

    // Optional remarks
    const remarks = faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || null;

    try {
      await db.insert(orderShippingDetails).values({
        referenceType: 'Swatch',
        referenceId: order.id,
        clientName: order.clientName || null,
        shippingVendorId: vendor.id,
        trackingNumber: trackingNumber,
        trackingUrl: trackingUrl,
        shipmentWeight: weight.toFixed(4),
        ratePerKg: ratePerKg.toFixed(4),
        calculatedShippingAmount: calculated.toFixed(2),
        manualShippingAmountOverride: null,
        finalShippingAmount: final.toFixed(2),
        shipmentStatus: status,
        shipmentDate: shipmentDate,
        expectedDeliveryDate: expectedDeliveryDate,
        actualDeliveryDate: actualDeliveryDate,
        remarks: remarks,
        createdBy: createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        deletedBy: null,
        deletedAt: null,
      });

      totalShippingDetails++;
      console.log(`  ✅ Created shipping details for order ${order.id} (${order.clientName}) - ${status}`);
    } catch (error) {
      console.error(`  ❌ Failed to create shipping details for order ${order.id}:`, error);
      failed++;
    }
  }

  console.log(`\n✅ ShippingDetailSeeder completed! Created ${totalShippingDetails} shipping details, skipped ${skipped}, failed ${failed}.`);
}

// ============================================
// Self-execution for ESM
// ============================================

var isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  var count = parseInt(process.argv[2]) || 0;
  seedShippingDetails(count).catch(console.error);
}