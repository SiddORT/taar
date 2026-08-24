import {
  db,
  inventoryItemsTable,
  stockAdjustmentsTable,
  stockLedgerTable,
  usersTable,
  materialsTable,
  fabricsTable,
  sql,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";

// Configuration
const ADJUSTMENT_TYPES = ["Damage", "Loss", "Manual Correction", "Audit Correction", "Opening Correction"];
const SEEDER_REF_TYPE = "Manual";
const SAMPLE_FRACTION = 0.3; // process 30% of items

export async function seedStockAdjustments(): Promise<void> {
  // 1. Idempotency check
  const existing = await db
    .select({ id: stockAdjustmentsTable.id })
    .from(stockAdjustmentsTable)
    .where(eq(stockAdjustmentsTable.referenceType, SEEDER_REF_TYPE))
    .limit(1);

  if (existing.length > 0) {
    console.log("[seedStockAdjustments] Adjustments already seeded. Skipping.");
    return;
  }

  // 2. Fetch active inventory items (materials & fabrics)
  const inventoryItems = await db
    .select()
    .from(inventoryItemsTable)
    .where(
      and(
        inArray(inventoryItemsTable.sourceType, ["material", "fabric"]),
        eq(inventoryItemsTable.isActive, true),
        eq(inventoryItemsTable.isDeleted, false)
      )
    );

  if (inventoryItems.length === 0) {
    console.log("[seedStockAdjustments] No inventory items found. Skipping.");
    return;
  }

  // 3. Fetch an active user
  const users = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.isActive, true), eq(usersTable.isDeleted, false)))
    .limit(1);

  const actor = users.length > 0 ? users[0].username : "System";

  // 4. Randomly sample inventory items
  const shuffled = inventoryItems.sort(() => Math.random() - 0.5);
  const sampleSize = Math.floor(inventoryItems.length * SAMPLE_FRACTION);
  const selectedItems = shuffled.slice(0, sampleSize);

  console.log(`[seedStockAdjustments] Selected ${selectedItems.length} inventory items.`);

  let totalAdjustments = 0;

  await db.transaction(async (tx) => {
    for (const item of selectedItems) {
      const numAdjustments = Math.random() < 0.3 ? 2 : 1;

      for (let i = 0; i < numAdjustments; i++) {
        const currentStock = parseFloat(item.currentStock) || 0;
        const styleReserved = parseFloat(item.styleReservedQty) || 0;
        const swatchReserved = parseFloat(item.swatchReservedQty) || 0;
        const available = currentStock - styleReserved - swatchReserved;

        let direction: "Increase" | "Decrease";
        let maxQty: number;

        if (available <= 0) {
          direction = "Increase";
          maxQty = 50;
        } else {
          direction = Math.random() < 0.6 ? "Decrease" : "Increase";
          maxQty = direction === "Decrease" ? Math.min(available, 30) : 50;
        }

        if (maxQty < 1) {
          if (direction === "Decrease") continue;
          maxQty = 10;
        }

        const qty = Math.floor(Math.random() * maxQty) + 1;
        if (qty <= 0) continue;

        const adjType = ADJUSTMENT_TYPES[Math.floor(Math.random() * ADJUSTMENT_TYPES.length)];

        const stockDelta = direction === "Increase" ? qty : -qty;
        const newStock = currentStock + stockDelta;
        const newAvailable = newStock - styleReserved - swatchReserved;

        // --- Update inventory item ---
        await tx
          .update(inventoryItemsTable)
          .set({
            currentStock: newStock.toString(),
            availableStock: Math.max(0, newAvailable).toString(),
            lastUpdatedAt: sql`now()`,
          })
          .where(eq(inventoryItemsTable.id, item.id));

        // --- Update master table (material or fabric) ---
        if (item.sourceType === "material") {
          await tx
            .update(materialsTable)
            .set({
              currentStock: newStock.toString(),
              // optionally update locationStocks? leaving as-is for simplicity
            })
            .where(eq(materialsTable.id, item.sourceId));
        } else if (item.sourceType === "fabric") {
          await tx
            .update(fabricsTable)
            .set({
              currentStock: newStock.toString(),
            })
            .where(eq(fabricsTable.id, item.sourceId));
        }

        // --- Insert into stock_adjustments ---
        const [adj] = await tx
          .insert(stockAdjustmentsTable)
          .values({
            itemId: item.sourceId,
            inventoryId: item.id,
            adjustmentType: adjType,
            adjustmentDirection: direction,
            adjustmentQuantity: qty.toString(),
            unit: item.unitType || null,
            averagePriceAtAdjustment: item.averagePrice || "0",
            revenueLossAmount:
              direction === "Decrease" && ["Damage", "Loss"].includes(adjType)
                ? (parseFloat(item.averagePrice) * qty).toString()
                : "0",
            referenceType: SEEDER_REF_TYPE,
            referenceId: null,
            reason: `Adjustment: ${adjType}`,
            remarks: `Auto-generated during seeding`,
            adjustedBy: actor,
            adjustmentDate: new Date().toISOString().split("T")[0],
          })
          .returning({ id: stockAdjustmentsTable.id });

        // --- Insert into stock_ledger ---
        await tx.insert(stockLedgerTable).values({
          itemId: item.id,
          transactionType: "adjustment",
          referenceNumber: adj.id.toString(),
          referenceType: SEEDER_REF_TYPE,
          inQuantity: direction === "Increase" ? qty.toString() : "0",
          outQuantity: direction === "Decrease" ? qty.toString() : "0",
          balanceQuantity: newStock.toString(),
          remarks: `${adjType} adjustment (${direction})`,
          createdBy: actor,
        });

        totalAdjustments++;
        console.log(`[seedStockAdjustments] ${direction} ${qty} (${adjType}) on ${item.itemCode} → new stock ${newStock}`);
      }
    }
  });

  console.log(`[seedStockAdjustments] Seeded ${totalAdjustments} adjustments for ${selectedItems.length} items.`);
}