import {
  db,
  swatchBomTable,
  swatchOrdersTable,
  inventoryItemsTable,
  materialReservationsTable,
  stockLedgerTable,
  materialsTable,
  fabricsTable,
  usersTable,
  eq,
  and,
  sql,
} from "@workspace/db";
import { faker } from "@faker-js/faker";

// ============================================
// Types
// ============================================

interface MaterialOrFabric {
  id: number;
  code: string;
  name: string;
  type: 'material' | 'fabric';
  currentStock: string;
  avgUnitPrice: string;
  unitType: string;
  warehouseLocation: string;
}

// ============================================
// Helper Functions
// ============================================

function getRandomQuantity(maxStock: number): string {
  // Generate a quantity that doesn't exceed available stock (use 20% of stock, min 1)
  const max = Math.min(maxStock, Math.max(1, Math.floor(maxStock * 0.2)));
  const qty = faker.number.int({ min: 1, max: Math.max(1, max) });
  return qty.toString();
}

function calculateEstimatedAmount(qty: string, price: string): string {
  const qtyNum = parseFloat(qty) || 0;
  const priceNum = parseFloat(price) || 0;
  return (qtyNum * priceNum).toFixed(2);
}

// ============================================
// Core Reservation Function (copied from StyleBom seeder)
// ============================================

async function autoReserveForBomSeeder(opts: {
  materialType: string;
  materialId: number;
  orderId: number;
  reservationType: "Style" | "Swatch";
  reqQty: number;
  bomRowId: number;
  materialName: string;
  actor: string;
}): Promise<{ status: "created" | "updated" | "skipped"; reason?: string; inventoryId?: number }> {
  const { materialType, materialId, orderId, reservationType, reqQty, bomRowId, materialName, actor } = opts;

  // 1. Fetch inventory record
  const invRows = await db
    .select({
      id: inventoryItemsTable.id,
      availableStock: inventoryItemsTable.availableStock,
      currentStock: inventoryItemsTable.currentStock,
    })
    .from(inventoryItemsTable)
    .where(
      and(
        eq(inventoryItemsTable.sourceType, materialType),
        eq(inventoryItemsTable.sourceId, materialId),
        eq(inventoryItemsTable.isDeleted, false)
      )
    )
    .limit(1);

  if (!invRows.length) {
    return { status: "skipped", reason: "No inventory record for this material" };
  }

  const inv = invRows[0];
  const avail = parseFloat(inv.availableStock ?? "0");
  const inventoryId = inv.id;

  if (reqQty > avail) {
    return {
      status: "skipped",
      reason: `Insufficient available stock — required ${reqQty}, available ${avail.toFixed(3)}`,
      inventoryId,
    };
  }

  // Determine the reserved column name in snake_case
  const colName = reservationType === "Style" ? "style_reserved_qty" : "swatch_reserved_qty";

  return await db.transaction(async (tx) => {
    // Check for existing active reservation
    const existingRes = await tx
      .select({
        id: materialReservationsTable.id,
        reservedQuantity: materialReservationsTable.reservedQuantity,
      })
      .from(materialReservationsTable)
      .where(
        and(
          eq(materialReservationsTable.inventoryId, inventoryId),
          eq(materialReservationsTable.reservationType, reservationType),
          eq(materialReservationsTable.referenceId, orderId),
          eq(materialReservationsTable.status, "Active"),
          eq(materialReservationsTable.isDeleted, false)
        )
      )
      .orderBy(sql`${materialReservationsTable.id} DESC`)
      .limit(1);

    let resultStatus: "created" | "updated";

    if (existingRes.length > 0) {
      // Update existing reservation
      const oldQty = parseFloat(existingRes[0].reservedQuantity);
      const delta = reqQty - oldQty;
      await tx
        .update(materialReservationsTable)
        .set({
          reservedQuantity: reqQty.toString(),
          remarks: `BOM row ${bomRowId} — ${materialName}`,
        })
        .where(eq(materialReservationsTable.id, existingRes[0].id));

      if (delta !== 0) {
        await tx.execute(
          sql`UPDATE inventory_items SET ${sql.raw(colName)} = ${sql.raw(colName)}::numeric + ${delta} WHERE id = ${inventoryId}`
        );
      }
      resultStatus = "updated";
    } else {
      // Create new reservation
      const today = new Date().toISOString().slice(0, 10);
      await tx.insert(materialReservationsTable).values({
        itemId: inventoryId,
        inventoryId,
        reservationType,
        referenceId: orderId,
        reservedQuantity: reqQty.toString(),
        status: "Active",
        remarks: `BOM row ${bomRowId} — ${materialName}`,
        reservedBy: actor,
        reservationDate: today,
      });

      await tx.execute(
        sql`UPDATE inventory_items SET ${sql.raw(colName)} = ${sql.raw(colName)}::numeric + ${reqQty} WHERE id = ${inventoryId}`
      );
      resultStatus = "created";
    }

    // Recalculate available_stock and update last_updated_at
    await tx.execute(
      sql`UPDATE inventory_items SET available_stock = GREATEST(0, current_stock::numeric - style_reserved_qty::numeric - swatch_reserved_qty::numeric), last_updated_at = NOW() WHERE id = ${inventoryId}`
    );

    // Stock ledger entry for new reservations only
    if (resultStatus === "created") {
      const bal = await tx
        .select({ currentStock: inventoryItemsTable.currentStock })
        .from(inventoryItemsTable)
        .where(eq(inventoryItemsTable.id, inventoryId))
        .limit(1);

      await tx.insert(stockLedgerTable).values({
        itemId: inventoryId,
        transactionType: `${reservationType.toLowerCase()}_reservation`,
        referenceNumber: String(orderId),
        referenceType: reservationType,
        inQuantity: "0",
        outQuantity: reqQty.toString(),
        balanceQuantity: bal[0].currentStock,
        remarks: `Reserved ${reqQty} for ${reservationType} Order #${orderId} (BOM row ${bomRowId})`,
        createdBy: actor,
      });
    }

    return { status: resultStatus, inventoryId };
  });
}

// ============================================
// Main Seed Function
// ============================================

export async function seedSwatchBom(count: number = 50): Promise<void> {
  console.log(`\n📦 Starting SwatchBomSeeder (generating 1-4 entries per order, with auto-reservation)...\n`);

  // 1. Fetch swatch orders
  const swatchOrders = await db
    .select({
      id: swatchOrdersTable.id,
      clientName: swatchOrdersTable.clientName,
    })
    .from(swatchOrdersTable)
    .where(eq(swatchOrdersTable.isDeleted, false))
    .limit(count * 2); // fetch more to have enough orders

  if (swatchOrders.length === 0) {
    console.warn('⚠️ No swatch orders found. Please run SwatchOrderSeeder first.');
    return;
  }
  console.log(`   ✅ Found ${swatchOrders.length} swatch orders`);

  // 2. Fetch active users
  const users = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.isActive, true));

  if (users.length === 0) console.warn("⚠️ No active users. Using 'system'.");
  const actor = users.length > 0 ? users[0].email : "system";

  // 3. Fetch materials with stock > 0
  const materials = await db
    .select({
      id: materialsTable.id,
      materialCode: materialsTable.materialCode,
      materialName: materialsTable.materialName,
      currentStock: materialsTable.currentStock,
      unitPrice: materialsTable.unitPrice,
      unitType: materialsTable.unitType,
      location: materialsTable.location,
    })
    .from(materialsTable)
    .where(
      and(
        eq(materialsTable.isActive, true),
        eq(materialsTable.isDeleted, false),
        sql`${materialsTable.currentStock}::numeric > 0`
      )
    );
  console.log(`   ✅ Found ${materials.length} materials with stock > 0`);

  // 4. Fetch fabrics with stock > 0
  const fabrics = await db
    .select({
      id: fabricsTable.id,
      fabricCode: fabricsTable.fabricCode,
      fabricType: fabricsTable.fabricType,
      quality: fabricsTable.quality,
      colorName: fabricsTable.colorName,
      currentStock: fabricsTable.currentStock,
      pricePerMeter: fabricsTable.pricePerMeter,
      unitType: fabricsTable.unitType,
      location: fabricsTable.location,
    })
    .from(fabricsTable)
    .where(
      and(
        eq(fabricsTable.isActive, true),
        eq(fabricsTable.isDeleted, false),
        sql`${fabricsTable.currentStock}::numeric > 0`
      )
    );
  console.log(`   ✅ Found ${fabrics.length} fabrics with stock > 0`);

  if (materials.length === 0 && fabrics.length === 0) {
    console.warn('⚠️ No materials or fabrics with stock. Cannot create BOM entries.');
    return;
  }

  // 5. Build item pool
  const itemPool: MaterialOrFabric[] = [];

  materials.forEach(m => {
    itemPool.push({
      id: m.id,
      code: m.materialCode,
      name: m.materialName || `${m.materialCode} - ${m.unitType}`,
      type: 'material',
      currentStock: m.currentStock || '0',
      avgUnitPrice: m.unitPrice || '0',
      unitType: m.unitType || '',
      warehouseLocation: m.location || '',
    });
  });

  fabrics.forEach(f => {
    const fabricName = `${f.fabricType} - ${f.quality} (${f.colorName})`;
    itemPool.push({
      id: f.id,
      code: f.fabricCode,
      name: fabricName,
      type: 'fabric',
      currentStock: f.currentStock || '0',
      avgUnitPrice: f.pricePerMeter || '0',
      unitType: f.unitType || 'Meter',
      warehouseLocation: f.location || '',
    });
  });

  console.log(`   📋 Total items with stock: ${itemPool.length}`);

  // 6. Generate BOM entries with reservations
  let totalInserted = 0;
  let totalReserved = 0;
  let totalSkipped = 0;

  for (const order of swatchOrders) {
    const numItems = faker.number.int({ min: 1, max: Math.min(4, itemPool.length) });
    const selectedItems = faker.helpers.arrayElements(itemPool, numItems);

    for (const item of selectedItems) {
      const stockNum = parseFloat(item.currentStock) || 0;
      if (stockNum <= 0) continue;

      const requiredQty = getRandomQuantity(stockNum);
      const reqQtyNum = parseFloat(requiredQty) || 0;
      const estimatedAmount = calculateEstimatedAmount(requiredQty, item.avgUnitPrice);

      // Check for duplicate BOM entry (same order + item)
      const existing = await db
        .select({ id: swatchBomTable.id })
        .from(swatchBomTable)
        .where(
          and(
            eq(swatchBomTable.swatchOrderId, order.id),
            eq(swatchBomTable.materialType, item.type),
            eq(swatchBomTable.materialId, item.id)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        console.log(`  ⏭️ Skipping duplicate BOM entry for order ${order.id}, ${item.code}`);
        continue;
      }

      // Insert BOM row
      const [bomRow] = await db
        .insert(swatchBomTable)
        .values({
          swatchOrderId: order.id,
          styleOrderId: null,
          materialType: item.type,
          materialId: item.id,
          materialCode: item.code,
          materialName: item.name,
          currentStock: item.currentStock,
          avgUnitPrice: item.avgUnitPrice,
          unitType: item.unitType,
          warehouseLocation: item.warehouseLocation,
          requiredQty,
          estimatedAmount,
          consumedQty: '0',
          targetVendorId: null,
          targetVendorName: null,
          createdBy: actor,
          createdAt: new Date(),
          isDeleted: false,
        })
        .returning();

      console.log(`  ✅ Inserted BOM row ${bomRow.id} for order ${order.id}: ${item.code} (${item.type}) - Qty: ${requiredQty}, Est: ${estimatedAmount}`);

      // Auto-reserve (matching API)
      if (reqQtyNum > 0) {
        const reservation = await autoReserveForBomSeeder({
          materialType: item.type,
          materialId: item.id,
          orderId: order.id,
          reservationType: "Swatch",
          reqQty: reqQtyNum,
          bomRowId: bomRow.id,
          materialName: item.name,
          actor,
        });

        if (reservation.status === "created" || reservation.status === "updated") {
          totalReserved++;
          console.log(`     🔒 Reservation ${reservation.status} for ${item.name} (qty ${requiredQty})`);
        } else {
          totalSkipped++;
          console.log(`     ⚠️ Skipped reservation: ${reservation.reason}`);
        }
      }

      totalInserted++;
    }
  }

  console.log(`\n✅ SwatchBomSeeder completed.`);
  console.log(`   📋 Inserted ${totalInserted} BOM entries`);
  console.log(`   🔒 Reserved ${totalReserved} items (${totalSkipped} skipped due to insufficient stock)`);
}

// ============================================
// Self-execution
// ============================================

const isMainModule = import.meta.url === "file://" + process.argv[1];
if (isMainModule) {
  const count = parseInt(process.argv[2]) || 50;
  seedSwatchBom(count).catch(console.error);
}