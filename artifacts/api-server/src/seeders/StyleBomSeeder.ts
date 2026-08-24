import {
  db,
  styleOrdersTable,
  swatchBomTable,
  inventoryItemsTable,
  materialReservationsTable,
  stockLedgerTable,
  fabricsTable,
  materialsTable,
  usersTable,
  eq,
  and,
  sql,
} from "@workspace/db";
import { faker } from "@faker-js/faker";

// ============================================
// Types
// ============================================

interface LocationStock {
  location: string;
  stock: string;
}

interface SourceItem {
  id: number;
  code: string;
  name: string;
  unitType: string;
  price: string;
  totalStock: string;
  locationStocks: LocationStock[];
}

// ============================================
// Helper Functions
// ============================================

function getRandomQty(): string {
  return faker.number.int({ min: 1, max: 100 }).toString();
}

function getRandomUserEmail(users: { email: string }[]): string {
  return users.length > 0 ? faker.helpers.arrayElement(users).email : "system";
}

function pickLocationWithStock(locationStocks: LocationStock[]): string | null {
  const available = locationStocks.filter((ls) => parseFloat(ls.stock) > 0);
  if (available.length === 0) return null;
  return faker.helpers.arrayElement(available).location;
}

// ============================================
// Core Reservation Function (matches API)
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
        // ✅ Use raw SQL to update the dynamic column
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

      // ✅ Raw SQL to increment the reserved column
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

export async function seedStyleBom(count: number = 30): Promise<void> {
  console.log(`\n📦 Starting StyleBomSeeder (generating 1-5 entries per order, with auto-reservation)...\n`);

  // 1. Fetch style orders
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
    console.warn("⚠️ No style orders found. Please seed style orders first.");
    return;
  }

  // 2. Fetch active users
  const users = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.isActive, true));

  const actor = users.length > 0 ? users[0].email : "system";
  if (users.length === 0) console.warn("⚠️ No active users. Using 'system'.");

  // 3. Fetch fabrics with stock locations
  const fabrics = await db
    .select({
      id: fabricsTable.id,
      code: fabricsTable.fabricCode,
      name: fabricsTable.colorName,
      unitType: fabricsTable.unitType,
      price: fabricsTable.pricePerMeter,
      totalStock: fabricsTable.currentStock,
      locationStocks: fabricsTable.locationStocks,
    })
    .from(fabricsTable)
    .where(eq(fabricsTable.isDeleted, false));

  const usableFabrics = fabrics
    .filter((f) => f.locationStocks?.some((ls) => parseFloat(ls.stock) > 0) ?? false)
    .map((f) => ({ ...f, name: f.name ?? f.code }));

  // 4. Fetch materials with stock locations
  const materials = await db
    .select({
      id: materialsTable.id,
      code: materialsTable.materialCode,
      name: materialsTable.materialName,
      unitType: materialsTable.unitType,
      price: materialsTable.unitPrice,
      totalStock: materialsTable.currentStock,
      locationStocks: materialsTable.locationStocks,
    })
    .from(materialsTable)
    .where(eq(materialsTable.isDeleted, false));

  const usableMaterials = materials
    .filter((m) => m.locationStocks?.some((ls) => parseFloat(ls.stock) > 0) ?? false)
    .map((m) => ({ ...m, name: m.name ?? m.code }));

  console.log(`   ✅ ${usableFabrics.length} fabrics, ${usableMaterials.length} materials with stock available`);

  const sourcePool: (SourceItem & { sourceType: "fabric" | "material" })[] = [
    ...usableFabrics.map((f) => ({ ...f, sourceType: "fabric" as const })),
    ...usableMaterials.map((m) => ({ ...m, sourceType: "material" as const })),
  ];

  if (sourcePool.length === 0) {
    console.warn("⚠️ No fabrics or materials with stock. Cannot create BOM entries.");
    return;
  }

  // ============================================
  // Generate BOM entries with reservations
  // ============================================
  let totalInserted = 0;
  let totalReserved = 0;
  let totalSkipped = 0;

  for (const order of styleOrders) {
    const numEntries = faker.number.int({ min: 1, max: 5 });

    for (let i = 0; i < numEntries; i++) {
      const source = faker.helpers.arrayElement(sourcePool);
      const location = pickLocationWithStock(source.locationStocks);
      if (!location) continue;

      const requiredQty = getRandomQty();
      const reqQtyNum = parseFloat(requiredQty) || 0;
      const price = parseFloat(source.price) || 0;
      const estimatedAmount = (reqQtyNum * price).toFixed(2);

      // Insert BOM row
      const [bomRow] = await db
        .insert(swatchBomTable)
        .values({
          styleOrderId: order.id,
          swatchOrderId: null,
          materialType: source.sourceType,
          materialId: source.id,
          materialCode: source.code,
          materialName: source.name,
          currentStock: source.totalStock,
          avgUnitPrice: source.price,
          unitType: source.unitType,
          warehouseLocation: location,
          requiredQty,
          estimatedAmount,
          consumedQty: "0",
          targetVendorId: null,
          targetVendorName: null,
          createdBy: actor,
          createdAt: new Date(),
          isDeleted: false,
        })
        .returning();

      console.log(`✅ Inserted BOM row ${bomRow.id} for order ${order.orderCode}: ${source.name} (${source.sourceType})`);

      // Auto‑reserve (matching API)
      if (reqQtyNum > 0) {
        const reservation = await autoReserveForBomSeeder({
          materialType: source.sourceType,
          materialId: source.id,
          orderId: order.id,
          reservationType: "Style",
          reqQty: reqQtyNum,
          bomRowId: bomRow.id,
          materialName: source.name,
          actor,
        });

        if (reservation.status === "created" || reservation.status === "updated") {
          totalReserved++;
          console.log(`   🔒 Reservation ${reservation.status} for ${source.name} (qty ${requiredQty})`);
        } else {
          totalSkipped++;
          console.log(`   ⚠️ Skipped reservation: ${reservation.reason}`);
        }
      }

      totalInserted++;
    }
  }

  console.log(`\n✅ StyleBomSeeder completed.`);
  console.log(`   📋 Inserted ${totalInserted} BOM entries`);
  console.log(`   🔒 Reserved ${totalReserved} items (${totalSkipped} skipped due to insufficient stock)`);
}

// ============================================
// Self-execution
// ============================================

const isMainModule = import.meta.url === "file://" + process.argv[1];
if (isMainModule) {
  const count = parseInt(process.argv[2]) || 30;
  seedStyleBom(count).catch(console.error);
}