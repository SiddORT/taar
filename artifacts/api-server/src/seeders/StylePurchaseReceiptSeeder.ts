import { db, eq, and, sql } from "@workspace/db";
import { faker } from "@faker-js/faker";
import {
  purchaseOrdersTable,
  purchaseOrderItems,
  purchaseReceiptsTable,
  purchaseReceiptItems,
  swatchBomTable,
  styleOrdersTable,
  vendorsTable,
  inventoryItemsTable,
  warehouseLocations,
  fabricsTable,
  materialsTable,
} from "@workspace/db";

// ============================================
// Types
// ============================================

interface BomItem {
  bomRowId: number;
  quantity: string;
  unitType: string;
  targetPrice: string;
  materialCode: string;
  materialName: string;
  targetVendorId?: number | null;
  targetVendorName?: string | null;
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  styleOrderId: number | null;
  swatchOrderId: number | null;
  vendorId: number | null;
  vendorName: string | null;
  status: string;
  bomRowIds: number[];
  bomItems: BomItem[];
  createdBy: string;
}

interface WarehouseLocation {
  id: number;
  name: string;
  code: string;
}

// ============================================
// Helper Functions
// ============================================

async function generatePrNumber(): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);

  const result = await db
    .select({ prNumber: purchaseReceiptsTable.prNumber })
    .from(purchaseReceiptsTable)
    .where(and(
      sql`${purchaseReceiptsTable.prNumber} LIKE ${'PR-' + year + '-%'}`,
      eq(purchaseReceiptsTable.isDeleted, false)
    ))
    .orderBy(sql`${purchaseReceiptsTable.prNumber} DESC`)
    .limit(1);

  let nextSeq = 1;
  if (result.length > 0) {
    const lastPr = result[0].prNumber;
    const parts = lastPr.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) {
        nextSeq = seq + 1;
      }
    }
  }

  const seqStr = String(nextSeq).padStart(4, '0');
  return `PR-${year}-${seqStr}`;
}

async function getWarehouseLocations(): Promise<WarehouseLocation[]> {
  const locations = await db
    .select({
      id: warehouseLocations.id,
      name: warehouseLocations.name,
      code: warehouseLocations.code,
    })
    .from(warehouseLocations)
    .where(eq(warehouseLocations.isDeleted, false))
    .orderBy(sql`RANDOM()`);

  return locations;
}

async function getRandomVendor(): Promise<{ id: number; brandName: string } | null> {
  const vendors = await db
    .select({ id: vendorsTable.id, brandName: vendorsTable.brandName })
    .from(vendorsTable)
    .where(eq(vendorsTable.isDeleted, false))
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (vendors.length === 0) {
    return null;
  }
  return vendors[0];
}

async function getInventoryItemByCode(code: string): Promise<{ id: number; averagePrice: string; currentStock: string } | null> {
  const items = await db
    .select({
      id: inventoryItemsTable.id,
      averagePrice: inventoryItemsTable.averagePrice,
      currentStock: inventoryItemsTable.currentStock,
    })
    .from(inventoryItemsTable)
    .where(and(
      eq(inventoryItemsTable.itemCode, code),
      eq(inventoryItemsTable.isDeleted, false)
    ))
    .limit(1);

  if (items.length === 0) {
    return null;
  }
  return items[0];
}

async function getBomRowDetails(bomRowId: number): Promise<{
  styleOrderId: number | null;
  materialType: string;
  materialId: number;
  materialCode: string;
  materialName: string;
  currentStock: string;
  avgUnitPrice: string;
  unitType: string;
  warehouseLocation: string;
} | null> {
  const rows = await db
    .select({
      styleOrderId: swatchBomTable.styleOrderId,
      materialType: swatchBomTable.materialType,
      materialId: swatchBomTable.materialId,
      materialCode: swatchBomTable.materialCode,
      materialName: swatchBomTable.materialName,
      currentStock: swatchBomTable.currentStock,
      avgUnitPrice: swatchBomTable.avgUnitPrice,
      unitType: swatchBomTable.unitType,
      warehouseLocation: swatchBomTable.warehouseLocation,
    })
    .from(swatchBomTable)
    .where(and(
      eq(swatchBomTable.id, bomRowId),
      eq(swatchBomTable.isDeleted, false)
    ))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

async function getAlreadyReceived(poId: number, bomRowId: number): Promise<number> {
  const result = await db
    .select({
      totalReceived: sql<string>`COALESCE(SUM(CAST(${purchaseReceiptsTable.receivedQty} AS NUMERIC)), 0)`,
    })
    .from(purchaseReceiptsTable)
    .where(and(
      eq(purchaseReceiptsTable.poId, poId),
      eq(purchaseReceiptsTable.bomRowId, bomRowId),
      eq(purchaseReceiptsTable.isDeleted, false)
    ));

  return parseFloat(result[0]?.totalReceived || '0');
}

async function getPurchaseOrderItemByInventoryId(poId: number, inventoryItemId: number): Promise<{ id: number; itemName: string; itemCode: string; itemImage: string | null; vendorId: number | null; vendorName: string | null } | null> {
  const items = await db
    .select({
      id: purchaseOrderItems.id,
      itemName: purchaseOrderItems.itemName,
      itemCode: purchaseOrderItems.itemCode,
      itemImage: purchaseOrderItems.itemImage,
      vendorId: purchaseOrderItems.vendorId,
      vendorName: purchaseOrderItems.vendorName,
    })
    .from(purchaseOrderItems)
    .where(and(
      eq(purchaseOrderItems.poId, poId),
      eq(purchaseOrderItems.inventoryItemId, inventoryItemId),
      eq(purchaseOrderItems.isDeleted, false)
    ))
    .limit(1);

  if (items.length === 0) {
    return null;
  }
  return items[0];
}

// ============================================
// Main Seed Function
// ============================================

export async function seedStylePurchaseReceipts(count: number = 0): Promise<void> {
  console.log(`\n📦 Starting StylePurchaseReceiptSeeder...`);

  // 1. Fetch purchase orders that have style_order_id NOT NULL
  const purchaseOrders = await db
    .select({
      id: purchaseOrdersTable.id,
      poNumber: purchaseOrdersTable.poNumber,
      styleOrderId: purchaseOrdersTable.styleOrderId,
      swatchOrderId: purchaseOrdersTable.swatchOrderId,
      vendorId: purchaseOrdersTable.vendorId,
      vendorName: purchaseOrdersTable.vendorName,
      status: purchaseOrdersTable.status,
      bomRowIds: purchaseOrdersTable.bomRowIds,
      bomItems: purchaseOrdersTable.bomItems,
      createdBy: purchaseOrdersTable.createdBy,
    })
    .from(purchaseOrdersTable)
    .where(and(
      eq(purchaseOrdersTable.isDeleted, false),
      sql`${purchaseOrdersTable.styleOrderId} IS NOT NULL`,
      sql`${purchaseOrdersTable.status} != 'Completed'`,
      sql`${purchaseOrdersTable.status} != 'Cancelled'`
    ));

  console.log(`   ✅ Found ${purchaseOrders.length} style purchase orders (excluding Completed/Cancelled)`);

  if (purchaseOrders.length === 0) {
    console.warn('⚠️ No style purchase orders found.');
    return;
  }

  // 2. Get warehouse locations
  const warehouses = await getWarehouseLocations();
  console.log(`   ✅ Found ${warehouses.length} warehouse locations`);

  // 3. Determine how many to process
  let ordersToProcess = purchaseOrders;
  if (count > 0 && count < purchaseOrders.length) {
    const shuffled = faker.helpers.shuffle(purchaseOrders);
    ordersToProcess = shuffled.slice(0, count);
    console.log(`   🔀 Processing a random subset of ${count} orders out of ${purchaseOrders.length}`);
  } else {
    console.log(`   📋 Processing all ${purchaseOrders.length} orders`);
  }

  let totalReceipts = 0;
  let skipped = 0;
  let failed = 0;
  let statusUpdated = 0;

  for (const po of ordersToProcess) {
    console.log(`\n📋 Processing PO: ${po.poNumber} (ID: ${po.id})`);

    // Check if order needs approval
    const eligibleStatuses = ['Approved', 'In Process', 'Partially Received'];
    if (!eligibleStatuses.includes(po.status)) {
      console.log(`  ℹ️ PO status is "${po.status}". Setting to "Approved"...`);
      await db
        .update(purchaseOrdersTable)
        .set({
          status: 'Approved',
          updatedAt: new Date(),
          updatedBy: 'system',
        })
        .where(eq(purchaseOrdersTable.id, po.id));
      statusUpdated++;
      po.status = 'Approved';
    }

    const bomItems = po.bomItems || [];

    if (bomItems.length === 0) {
      console.log(`  ⚠️ No BOM items found, skipping`);
      skipped++;
      continue;
    }

    // Process each BOM item
    for (const bomItem of bomItems) {
      const bomRowId = bomItem.bomRowId;
      const orderedQty = parseFloat(bomItem.quantity || '0');

      if (orderedQty <= 0) {
        console.log(`  ⚠️ BOM ${bomRowId} has zero quantity, skipping`);
        continue;
      }

      // Get already received quantity
      const alreadyReceived = await getAlreadyReceived(po.id, bomRowId);
      const remainingQty = Math.max(0, orderedQty - alreadyReceived);

      if (remainingQty <= 0) {
        console.log(`  ⏭️ BOM ${bomRowId} already fully received (${alreadyReceived}/${orderedQty})`);
        continue;
      }

      // Random receipt quantity (1 to 50% of remaining)
      const receiptQty = faker.number.int({
        min: 1,
        max: Math.max(1, Math.min(remainingQty, Math.ceil(remainingQty * 0.5)))
      });

      // Get BOM row details (includes styleOrderId)
      const bomRow = await getBomRowDetails(bomRowId);
      if (!bomRow) {
        console.log(`  ⚠️ BOM ${bomRowId} not found, skipping`);
        continue;
      }

      // Only proceed if this BOM row is linked to a style order (should be, but double-check)
      if (!bomRow.styleOrderId) {
        console.log(`  ⚠️ BOM ${bomRowId} has no style_order_id, skipping`);
        continue;
      }

      // Get inventory item
      const inventoryItem = await getInventoryItemByCode(bomItem.materialCode);
      if (!inventoryItem) {
        console.log(`  ⚠️ Inventory item not found for ${bomItem.materialCode}, skipping`);
        continue;
      }

      const unitPrice = parseFloat(bomItem.targetPrice || inventoryItem.averagePrice || '0');

      // Determine vendor
      let vendorId = po.vendorId;
      let vendorName = po.vendorName;
      if (!vendorId || !vendorName) {
        const randomVendor = await getRandomVendor();
        if (randomVendor) {
          vendorId = randomVendor.id;
          vendorName = randomVendor.brandName;
        } else {
          vendorName = 'Unknown Vendor';
        }
      }

      // Warehouse location
      const warehouse = faker.helpers.arrayElement(warehouses);
      const warehouseName = warehouse?.name || 'Unallocated';

      // Generate PR number
      const prNumber = await generatePrNumber();

      // Get purchase order item
      const poItem = await getPurchaseOrderItemByInventoryId(po.id, inventoryItem.id);

      try {
        await db.transaction(async (tx) => {
          // 1. Insert purchase receipt (with style_order_id)
          const [pr] = await tx
            .insert(purchaseReceiptsTable)
            .values({
              prNumber: prNumber,
              poId: po.id,
              bomRowId: bomRowId,
              swatchOrderId: null,       // style only
              styleOrderId: bomRow.styleOrderId,
              vendorName: vendorName || '',
              receivedQty: receiptQty.toString(),
              actualPrice: unitPrice.toFixed(2),
              warehouseLocation: warehouseName,
              status: 'Open',
              createdBy: faker.helpers.arrayElement(['system', 'admin@taar.com']),
              createdAt: new Date(),
              isDeleted: false,
            })
            .returning({ id: purchaseReceiptsTable.id });

          // 2. Insert purchase receipt item
          await tx
            .insert(purchaseReceiptItems)
            .values({
              prId: pr.id,
              inventoryItemId: inventoryItem.id,
              itemName: bomItem.materialName || bomRow.materialName,
              itemCode: bomItem.materialCode,
              quantity: receiptQty,
              unitPrice: unitPrice,
              warehouseLocation: warehouseName,
              remarks: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) || null,
              poItemId: poItem?.id || null,
              itemImage: null,
              vendorId: vendorId,
              vendorName: vendorName || '',
              createdAt: new Date().toISOString(),
              isDeleted: false,
            } as any); // type assertion due to potential column mismatches

          // 3. Update inventory item stock
          const prevStock = parseFloat(inventoryItem.currentStock || '0');
          const newStock = prevStock + receiptQty;
          const prevAvg = parseFloat(inventoryItem.averagePrice || '0');
          const newAvg = newStock > 0
            ? ((prevStock * prevAvg) + (receiptQty * unitPrice)) / newStock
            : unitPrice;
          const availableStock = newStock;

          await tx
            .update(inventoryItemsTable)
            .set({
              currentStock: newStock.toFixed(3),
              availableStock: availableStock.toFixed(3),
              averagePrice: newAvg.toFixed(2),
              lastPurchasePrice: unitPrice.toFixed(2),
              lastUpdatedAt: new Date(),
            })
            .where(eq(inventoryItemsTable.id, inventoryItem.id));

          // 4. Update master table (fabrics or materials)
          const masterTable = bomRow.materialType === 'fabric' ? fabricsTable : materialsTable;
          const masterId = bomRow.materialId;

          const [masterRow] = await tx
            .select({
              currentStock: masterTable.currentStock,
              locationStocks: masterTable.locationStocks,
            })
            .from(masterTable)
            .where(eq(masterTable.id, masterId))
            .limit(1);

          if (masterRow) {
            const masterNewStock = parseFloat(masterRow.currentStock || '0') + receiptQty;

            const locStocks = masterRow.locationStocks as Array<{ location: string; stock: string }> || [];
            const locIdx = locStocks.findIndex(l => l.location === warehouseName);
            if (locIdx >= 0) {
              locStocks[locIdx].stock = (parseFloat(locStocks[locIdx].stock || '0') + receiptQty).toFixed(3);
            } else {
              locStocks.push({ location: warehouseName, stock: receiptQty.toFixed(3) });
            }

            await tx
              .update(masterTable)
              .set({
                currentStock: masterNewStock.toFixed(3),
                locationStocks: locStocks,
              })
              .where(eq(masterTable.id, masterId));
          }

          // 5. Update BOM current stock
          await tx
            .update(swatchBomTable)
            .set({
              currentStock: newStock.toFixed(3),
              updatedAt: new Date(),
              updatedBy: 'system',
            })
            .where(eq(swatchBomTable.id, bomRowId));

          // 6. Stock ledger entry
          await tx.execute(sql`
            INSERT INTO stock_ledger
              (item_id, transaction_type, reference_number, reference_type,
               in_quantity, out_quantity, balance_quantity, remarks, created_by, created_at)
            VALUES (
              ${inventoryItem.id},
              'purchase_receipt',
              ${prNumber},
              'COSTING-PR',
              ${receiptQty.toFixed(3)},
              0,
              ${newStock.toFixed(3)},
              ${'Purchase Receipt ' + prNumber},
              ${'system'},
              NOW()
            )
          `);

          // 7. Inventory stock log
          try {
            await tx.execute(sql`
              INSERT INTO inventory_stock_logs
                (inventory_item_id, action_type, quantity_before, quantity_after, quantity_delta,
                 reference_type, reference_id, notes, created_by_name, created_at)
              VALUES (
                ${inventoryItem.id},
                'receipt',
                ${prevStock.toFixed(3)},
                ${newStock.toFixed(3)},
                ${receiptQty.toFixed(3)},
                'COSTING-PR',
                ${pr.id},
                ${'Purchase Receipt ' + prNumber},
                ${'system'},
                NOW()
              )
            `);
          } catch (logError) {
            // non‑critical
            console.log(`  ⚠️ Stock log failed (non‑critical):`, logError);
          }

          console.log(`  ✅ Created PR ${prNumber} for BOM ${bomRowId}: ${receiptQty}/${orderedQty} (Already received: ${alreadyReceived})`);
        });

        totalReceipts++;
      } catch (error) {
        console.error(`  ❌ Failed to create PR for BOM ${bomRowId}:`, error);
        failed++;
      }
    }
  }

  console.log(`\n✅ StylePurchaseReceiptSeeder completed! Created ${totalReceipts} receipts, skipped ${skipped}, failed ${failed}.`);
  if (statusUpdated > 0) {
    console.log(`   ℹ️ Updated ${statusUpdated} purchase order(s) to "Approved" status.`);
  }
}

// ============================================
// Self-execution
// ============================================

const isMainModule = import.meta.url === 'file://' + process.argv[1];

if (isMainModule) {
  const count = parseInt(process.argv[2]) || 0;
  seedStylePurchaseReceipts(count).catch(console.error);
}