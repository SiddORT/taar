import { 
  db, 
  swatchOrdersTable, 
  styleOrdersTable,
  outsourceJobsTable, 
  customChargesTable, 
  costingPaymentsTable, 
  eq, 
  and, 
  sql,
  or
} from "@workspace/db";
import { faker } from "@faker-js/faker";

// ============================================
// Types
// ============================================

interface CostingPaymentSeedData {
  vendorId: number;
  vendorName: string;
  referenceType: string;
  referenceId: number;
  swatchOrderId: number | null;
  styleOrderId: number | null;
  paymentType: string;
  paymentMode: string;
  paymentAmount: string;
  paymentStatus: string;
  transactionId: string | null;
  paymentDate: string;
  remarks: string | null;
  currencyCode: string;
  exchangeRateSnapshot: string;
  createdBy: string;
}

interface OrderInfo {
  id: number;
  orderCode: string;
  name: string;
  type: 'swatch' | 'style';
}

// ============================================
// Helper Functions
// ============================================

function getRandomPaymentType(): string {
  return faker.helpers.arrayElement(['Advance', 'Partial', 'Full']);
}

function getRandomPaymentMode(): string {
  return faker.helpers.arrayElement(['Bank Transfer', 'Cash', 'UPI']);
}

function getRandomPaymentStatus(): string {
  return faker.helpers.arrayElement(['Pending', 'Processing', 'Completed', 'Failed']);
}

function getRandomCurrencyCode(): string {
  return faker.helpers.arrayElement(['INR', 'USD', 'EUR', 'GBP']);
}

function generateTransactionId(): string {
  return 'TXN-' + faker.string.alphanumeric(12).toUpperCase();
}

function getRandomExchangeRate(): string {
  return (faker.number.float({ min: 0.5, max: 100, fractionDigits: 6 })).toFixed(6);
}

/**
 * Parse date string and add random days to ensure payment is after delivery
 */
function getPaymentDateAfterDelivery(deliveryDate: string | null): string {
  if (!deliveryDate) {
    const date = faker.date.recent({ days: 30 });
    return date.toISOString().slice(0, 10);
  }
  
  const baseDate = new Date(deliveryDate);
  const daysToAdd = faker.number.int({ min: 1, max: 30 });
  const paymentDate = new Date(baseDate);
  paymentDate.setDate(paymentDate.getDate() + daysToAdd);
  
  return paymentDate.toISOString().slice(0, 10);
}

/**
 * Get payment date after creation date for custom charges
 */
function getPaymentDateAfterCreation(createdAt: Date | null): string {
  if (!createdAt) {
    const date = faker.date.recent({ days: 30 });
    return date.toISOString().slice(0, 10);
  }
  
  const daysToAdd = faker.number.int({ min: 1, max: 15 });
  const paymentDate = new Date(createdAt);
  paymentDate.setDate(paymentDate.getDate() + daysToAdd);
  
  return paymentDate.toISOString().slice(0, 10);
}

/**
 * Calculate payment amount based on total amount from custom charge
 */
function calculatePaymentAmountFromTotal(totalAmount: string, paymentType: string): string {
  const amount = parseFloat(totalAmount);
  
  if (isNaN(amount) || amount === 0) {
    return faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }).toFixed(2);
  }
  
  switch (paymentType) {
    case 'Full':
      const fullMultiplier = faker.number.float({ min: 0.95, max: 1.05, fractionDigits: 2 });
      return (amount * fullMultiplier).toFixed(2);
      
    case 'Partial':
      const partialMultiplier = faker.number.float({ min: 0.2, max: 0.8, fractionDigits: 2 });
      return (amount * partialMultiplier).toFixed(2);
      
    case 'Advance':
      const advanceMultiplier = faker.number.float({ min: 0.1, max: 0.5, fractionDigits: 2 });
      return (amount * advanceMultiplier).toFixed(2);
      
    default:
      return amount.toFixed(2);
  }
}

/**
 * Calculate payment amount based on total cost from outsource job
 */
function calculatePaymentAmountFromJob(totalCost: string, paymentType: string): string {
  const cost = parseFloat(totalCost);
  
  if (isNaN(cost) || cost === 0) {
    return faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 }).toFixed(2);
  }
  
  switch (paymentType) {
    case 'Full':
      const fullMultiplier = faker.number.float({ min: 0.95, max: 1.05, fractionDigits: 2 });
      return (cost * fullMultiplier).toFixed(2);
      
    case 'Partial':
      const partialMultiplier = faker.number.float({ min: 0.2, max: 0.8, fractionDigits: 2 });
      return (cost * partialMultiplier).toFixed(2);
      
    case 'Advance':
      const advanceMultiplier = faker.number.float({ min: 0.1, max: 0.5, fractionDigits: 2 });
      return (cost * advanceMultiplier).toFixed(2);
      
    default:
      return cost.toFixed(2);
  }
}

/**
 * Create payment for a single item (job or charge)
 */
function createPaymentForItem(
  item: {
    type: 'outsource_job' | 'custom_charge';
    id: number;
    swatchOrderId: number | null;
    styleOrderId: number | null;
    vendorId: number;
    vendorName: string;
    amount: string;
    dateField?: string | null;
    createdAt?: Date | null;
    description?: string | null;
  },
  order: OrderInfo
): CostingPaymentSeedData {
  // Generate payment details
  const paymentType = getRandomPaymentType();
  const paymentMode = getRandomPaymentMode();
  const paymentStatus = faker.datatype.boolean({ probability: 0.7 }) 
    ? 'Completed' 
    : getRandomPaymentStatus();
  
  // Calculate payment date based on item type
  let paymentDate: string;
  if (item.type === 'outsource_job') {
    paymentDate = getPaymentDateAfterDelivery(item.dateField || null);
  } else {
    paymentDate = getPaymentDateAfterCreation(item.createdAt || null);
  }

  // Calculate payment amount
  let paymentAmount: string;
  if (item.type === 'outsource_job') {
    paymentAmount = calculatePaymentAmountFromJob(item.amount, paymentType);
  } else {
    paymentAmount = calculatePaymentAmountFromTotal(item.amount, paymentType);
  }

  const transactionId = faker.datatype.boolean({ probability: 0.6 }) 
    ? generateTransactionId() 
    : null;

  let remarks: string | null = null;
  if (faker.datatype.boolean({ probability: 0.3 })) {
    if (item.type === 'outsource_job') {
      remarks = faker.helpers.arrayElement([
        'Payment for outsource job completed',
        'Outsource vendor payment processed',
        'Final settlement for outsource work',
        'Advance payment for outsource job',
        'Partial payment released to vendor',
      ]);
    } else {
      remarks = faker.helpers.arrayElement([
        `Payment for custom charge: ${item.description || 'Miscellaneous charge'}`,
        'Custom charge payment processed',
        'Vendor payment for custom work',
        'Special charge settlement',
      ]);
    }
  }

  return {
    vendorId: item.vendorId,
    vendorName: item.vendorName,
    referenceType: item.type,
    referenceId: item.id,
    swatchOrderId: item.swatchOrderId,
    styleOrderId: item.styleOrderId,
    paymentType: paymentType,
    paymentMode: paymentMode,
    paymentAmount: paymentAmount,
    paymentStatus: paymentStatus,
    transactionId: transactionId,
    paymentDate: paymentDate,
    remarks: remarks,
    currencyCode: getRandomCurrencyCode(),
    exchangeRateSnapshot: getRandomExchangeRate(),
    createdBy: faker.helpers.arrayElement(['admin', 'system', 'finance', 'accounts']),
  };
}

// ============================================
// Main Seed Function
// ============================================

export async function seedCostingPayments(): Promise<void> {
  console.log('\n💰 Starting CostingPaymentSeeder for all completed orders...\n');

  // 1. Fetch all completed swatch orders
  const completedSwatchOrders = await db
    .select({
      id: swatchOrdersTable.id,
      orderCode: swatchOrdersTable.orderCode,
      name: swatchOrdersTable.swatchName,
    })
    .from(swatchOrdersTable)
    .where(
      and(
        eq(swatchOrdersTable.orderStatus, 'Completed'),
        eq(swatchOrdersTable.isDeleted, false)
      )
    );

  console.log(`   ✅ Found ${completedSwatchOrders.length} completed swatch orders`);

  // 2. Fetch all completed style orders
  const completedStyleOrders = await db
    .select({
      id: styleOrdersTable.id,
      orderCode: styleOrdersTable.orderCode,
      name: styleOrdersTable.styleName,
    })
    .from(styleOrdersTable)
    .where(
      and(
        eq(styleOrdersTable.orderStatus, 'Completed'),
        eq(styleOrdersTable.isDeleted, false)
      )
    );

  console.log(`   ✅ Found ${completedStyleOrders.length} completed style orders`);

  const allCompletedOrders: OrderInfo[] = [
    ...completedSwatchOrders.map(o => ({ ...o, type: 'swatch' as const })),
    ...completedStyleOrders.map(o => ({ ...o, type: 'style' as const }))
  ];

  if (allCompletedOrders.length === 0) {
    console.warn('⚠️ No completed orders found (swatch or style).');
    return;
  }

  // Extract IDs for querying
  const swatchOrderIds = completedSwatchOrders.map(o => o.id);
  const styleOrderIds = completedStyleOrders.map(o => o.id);

  // 3. Fetch outsource jobs for these orders (both swatch and style)
  const outsourceJobs = await db
    .select({
      id: outsourceJobsTable.id,
      swatchOrderId: outsourceJobsTable.swatchOrderId,
      styleOrderId: outsourceJobsTable.styleOrderId,
      vendorId: outsourceJobsTable.vendorId,
      vendorName: outsourceJobsTable.vendorName,
      totalCost: outsourceJobsTable.totalCost,
      deliveryDate: outsourceJobsTable.deliveryDate,
      issueDate: outsourceJobsTable.issueDate,
    })
    .from(outsourceJobsTable)
    .where(
      and(
        eq(outsourceJobsTable.isDeleted, false),
        or(
          sql`${outsourceJobsTable.swatchOrderId} IN (${sql.join(swatchOrderIds, sql`, `)})`,
          sql`${outsourceJobsTable.styleOrderId} IN (${sql.join(styleOrderIds, sql`, `)})`
        )
      )
    );

  console.log(`   ✅ Found ${outsourceJobs.length} outsource jobs for these orders`);

  // 4. Fetch custom charges for these orders (both swatch and style)
  const customCharges = await db
    .select({
      id: customChargesTable.id,
      swatchOrderId: customChargesTable.swatchOrderId,
      styleOrderId: customChargesTable.styleOrderId,
      vendorId: customChargesTable.vendorId,
      vendorName: customChargesTable.vendorName,
      totalAmount: customChargesTable.totalAmount,
      description: customChargesTable.description,
      createdAt: customChargesTable.createdAt,
    })
    .from(customChargesTable)
    .where(
      and(
        eq(customChargesTable.isDeleted, false),
        or(
          sql`${customChargesTable.swatchOrderId} IN (${sql.join(swatchOrderIds, sql`, `)})`,
          sql`${customChargesTable.styleOrderId} IN (${sql.join(styleOrderIds, sql`, `)})`
        )
      )
    );

  console.log(`   ✅ Found ${customCharges.length} custom charges for these orders`);

  if (outsourceJobs.length === 0 && customCharges.length === 0) {
    console.warn('⚠️ No outsource jobs or custom charges found for completed orders.');
    return;
  }

  // 5. Fetch existing costing payments to check what's already been paid
  const allOrderIds = allCompletedOrders.map(o => o.id);
  
  const existingPayments = await db
    .select({
      referenceId: costingPaymentsTable.referenceId,
      referenceType: costingPaymentsTable.referenceType,
      swatchOrderId: costingPaymentsTable.swatchOrderId,
      styleOrderId: costingPaymentsTable.styleOrderId,
    })
    .from(costingPaymentsTable)
    .where(
      and(
        sql`${costingPaymentsTable.referenceType} IN ('outsource_job', 'custom_charge')`,
        eq(costingPaymentsTable.isDeleted, false),
        or(
          sql`${costingPaymentsTable.swatchOrderId} IN (${sql.join(swatchOrderIds, sql`, `)})`,
          sql`${costingPaymentsTable.styleOrderId} IN (${sql.join(styleOrderIds, sql`, `)})`
        )
      )
    );

  // Create a set of existing payment references
  const existingPaymentRefs = new Set(
    existingPayments.map(p => `${p.referenceType}_${p.referenceId}`)
  );

  console.log(`   📊 Found ${existingPaymentRefs.size} existing payments`);

  // 6. Identify what needs to be created
  const itemsToCreate: Array<{
    type: 'outsource_job' | 'custom_charge';
    id: number;
    swatchOrderId: number | null;
    styleOrderId: number | null;
    vendorId: number;
    vendorName: string;
    amount: string;
    dateField?: string | null;
    createdAt?: Date | null;
    description?: string | null;
  }> = [];

  // Process outsource jobs
  for (const job of outsourceJobs) {
    const paymentKey = `outsource_job_${job.id}`;
    if (!existingPaymentRefs.has(paymentKey)) {
      // Determine which order this job belongs to
      const orderId = job.swatchOrderId || job.styleOrderId;
      const order = allCompletedOrders.find(o => o.id === orderId);
      if (order) {
        itemsToCreate.push({
          type: 'outsource_job',
          id: job.id,
          swatchOrderId: job.swatchOrderId,
          styleOrderId: job.styleOrderId,
          vendorId: job.vendorId,
          vendorName: job.vendorName,
          amount: job.totalCost,
          dateField: job.deliveryDate,
        });
      }
    }
  }

  // Process custom charges
  for (const charge of customCharges) {
    const paymentKey = `custom_charge_${charge.id}`;
    if (!existingPaymentRefs.has(paymentKey)) {
      const orderId = charge.swatchOrderId || charge.styleOrderId;
      const order = allCompletedOrders.find(o => o.id === orderId);
      if (order) {
        itemsToCreate.push({
          type: 'custom_charge',
          id: charge.id,
          swatchOrderId: charge.swatchOrderId,
          styleOrderId: charge.styleOrderId,
          vendorId: charge.vendorId,
          vendorName: charge.vendorName,
          amount: charge.totalAmount,
          createdAt: charge.createdAt,
          description: charge.description,
        });
      }
    }
  }

  console.log(`   📊 Need to create ${itemsToCreate.length} payments to cover all missing records`);

  if (itemsToCreate.length === 0) {
    console.log('✅ All completed orders already have costing payments for their outsource jobs and custom charges.');
    return;
  }

  // 7. Generate payments for all missing items
  const paymentsToCreate: CostingPaymentSeedData[] = [];
  
  for (const item of itemsToCreate) {
    const orderId = item.swatchOrderId || item.styleOrderId;
    const order = allCompletedOrders.find(o => o.id === orderId);
    if (!order) continue;

    const paymentData = createPaymentForItem(item, order);
    paymentsToCreate.push(paymentData);

    const itemLabel = item.type === 'outsource_job' ? 'job' : 'charge';
    console.log(`   📝 Generated payment for ${itemLabel} #${item.id} (${item.vendorName}) - ${paymentData.paymentType} - ${paymentData.paymentMode} - ₹${paymentData.paymentAmount}`);
  }

  console.log(`\n📋 Generated ${paymentsToCreate.length} costing payments`);

  // 8. Insert payments into database
  let insertedCount = 0;
  for (const data of paymentsToCreate) {
    try {
      const baseAmount = (parseFloat(data.paymentAmount) * parseFloat(data.exchangeRateSnapshot)).toFixed(2);

      const [payment] = await db.insert(costingPaymentsTable).values({
        vendorId: data.vendorId,
        vendorName: data.vendorName,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        swatchOrderId: data.swatchOrderId,
        styleOrderId: data.styleOrderId,
        paymentType: data.paymentType,
        paymentMode: data.paymentMode,
        paymentAmount: data.paymentAmount,
        currencyCode: data.currencyCode,
        exchangeRateSnapshot: data.exchangeRateSnapshot,
        baseCurrencyAmount: baseAmount,
        paymentStatus: data.paymentStatus,
        transactionId: data.transactionId,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        remarks: data.remarks,
        createdBy: data.createdBy,
        createdAt: new Date(),
      }).returning();

      insertedCount++;
      const itemLabel = data.referenceType === 'outsource_job' ? 'Job' : 'Custom Charge';
      const orderType = data.swatchOrderId ? 'Swatch' : 'Style';
      const orderId = data.swatchOrderId || data.styleOrderId;
      console.log(
        `✅ Created costing payment: #${payment.id} - ${data.vendorName} (${itemLabel} #${data.referenceId}, ${orderType} Order #${orderId}, ₹${data.paymentAmount})`
      );
    } catch (error) {
      console.error(`❌ Failed to create costing payment for ${data.referenceType} #${data.referenceId}`, error);
    }
  }

  // 9. Final Summary
  const jobPayments = paymentsToCreate.filter(p => p.referenceType === 'outsource_job').length;
  const chargePayments = paymentsToCreate.filter(p => p.referenceType === 'custom_charge').length;
  
  console.log('\n✅ CostingPaymentSeeder completed!');
  console.log(`   Total completed orders: ${allCompletedOrders.length} (${completedSwatchOrders.length} swatch, ${completedStyleOrders.length} style)`);
  console.log(`   Created ${insertedCount} costing payments:`);
  console.log(`   - ${jobPayments} for outsource jobs`);
  console.log(`   - ${chargePayments} for custom charges`);
  
  // Check if any records are still missing (optional)
  const remainingJobs = outsourceJobs.filter(job => !existingPaymentRefs.has(`outsource_job_${job.id}`));
  const remainingCharges = customCharges.filter(charge => !existingPaymentRefs.has(`custom_charge_${charge.id}`));
  
  if (remainingJobs.length === 0 && remainingCharges.length === 0) {
    console.log('   ✅ All completed orders now have complete costing payments!');
  } else {
    console.log(`   ⚠️ Still missing payments for ${remainingJobs.length} jobs and ${remainingCharges.length} custom charges`);
  }
}

// ============================================
// Self-execution for ESM
// ============================================

const isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  seedCostingPayments().catch(console.error);
}