// SwatchConsumptionSeeder.ts

import { db } from "@workspace/db";
import { 
  swatchOrdersTable, 
  swatchBomTable, 
  consumptionLogTable,
  usersTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { pool } from "@workspace/db";

/**
 * Parse date string or return a default date
 */
function parseDate(dateStr: string | null | undefined): Date {
  if (!dateStr) {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }
  
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }
  return parsed;
}

/**
 * Get a random date between two dates
 */
function getRandomDateBetween(start: Date, end: Date): Date {
  const diff = end.getTime() - start.getTime();
  const randomDiff = Math.random() * diff;
  return new Date(start.getTime() + randomDiff);
}

/**
 * Directly update inventory tables without calling the sync function
 */
async function updateInventoryDirectly(
  bomItem: any,
  consumedQty: number,
  consumptionId: number,
  consumedBy: string
) {
  const client = await (pool as any).connect();
  try {
    await client.query("BEGIN");

    // Find the inventory item
    const invResult = await client.query(
      `SELECT id, current_stock, swatch_reserved_qty, available_stock 
       FROM inventory_items 
       WHERE source_type = $1 AND source_id = $2 AND is_deleted = false
       LIMIT 1`,
      [bomItem.materialType, bomItem.materialId]
    );

    if (invResult.rows.length === 0) {
      console.log(`    ⚠️ No inventory item found for ${bomItem.materialCode}, skipping inventory sync`);
      await client.query("ROLLBACK");
      return;
    }

    const inventory = invResult.rows[0];
    const inventoryId = inventory.id;

    // Update current stock in inventory_items
    await client.query(
      `UPDATE inventory_items 
       SET current_stock = GREATEST(0, current_stock::numeric - $1),
           last_updated_at = NOW()
       WHERE id = $2`,
      [consumedQty, inventoryId]
    );

    // Update swatch_reserved_qty if there are active reservations
    const reservationResult = await client.query(
      `SELECT id, reserved_quantity FROM material_reservations
       WHERE inventory_id = $1 
       AND reservation_type = 'Swatch' 
       AND reference_id = $2 
       AND status = 'Active' 
       AND is_deleted = false
       ORDER BY id DESC LIMIT 1`,
      [inventoryId, bomItem.swatchOrderId]
    );

    if (reservationResult.rows.length > 0) {
      const reservation = reservationResult.rows[0];
      const oldReservedQty = parseFloat(reservation.reserved_quantity);
      const newReservedQty = Math.max(0, oldReservedQty - consumedQty);

      if (newReservedQty <= 0) {
        await client.query(
          `UPDATE material_reservations 
           SET reserved_quantity = 0, status = 'Converted' 
           WHERE id = $1`,
          [reservation.id]
        );
        await client.query(
          `UPDATE inventory_items 
           SET swatch_reserved_qty = GREATEST(0, swatch_reserved_qty::numeric - $1)
           WHERE id = $2`,
          [oldReservedQty, inventoryId]
        );
      } else {
        await client.query(
          `UPDATE material_reservations 
           SET reserved_quantity = $1 
           WHERE id = $2`,
          [newReservedQty, reservation.id]
        );
        await client.query(
          `UPDATE inventory_items 
           SET swatch_reserved_qty = GREATEST(0, swatch_reserved_qty::numeric - $1)
           WHERE id = $2`,
          [consumedQty, inventoryId]
        );
      }
    }

    // Update available_stock
    await client.query(
      `UPDATE inventory_items
       SET available_stock = GREATEST(0, current_stock::numeric - style_reserved_qty::numeric - swatch_reserved_qty::numeric)
       WHERE id = $1`,
      [inventoryId]
    );

    // Add stock ledger entry
    const newBalance = await client.query(
      `SELECT current_stock FROM inventory_items WHERE id = $1 AND is_deleted = false`,
      [inventoryId]
    );

    await client.query(
      `INSERT INTO stock_ledger 
       (item_id, transaction_type, reference_number, reference_type, in_quantity, out_quantity, balance_quantity, remarks, created_by, consumption_log_id)
       VALUES ($1, 'consumption', $2, 'Swatch', $3, $4, $5, $6, $7, $8)`,
      [
        inventoryId,
        String(bomItem.swatchOrderId),
        0,
        consumedQty,
        newBalance.rows[0].current_stock,
        `Consumption from Swatch Order #${bomItem.swatchOrderId} (log #${consumptionId})`,
        consumedBy,
        consumptionId
      ]
    );

    // Update master table (fabrics/materials)
    const masterTable = bomItem.materialType === "fabric" ? "fabrics" : "materials";
    const masterResult = await client.query(
      `SELECT current_stock, location_stocks FROM ${masterTable} WHERE id = $1 AND is_deleted = false`,
      [bomItem.materialId]
    );

    if (masterResult.rows.length > 0) {
      const masterRow = masterResult.rows[0];
      const newMasterStock = Math.max(0, parseFloat(masterRow.current_stock || "0") - consumedQty);
      let locationStocks = masterRow.location_stocks || [];

      if (bomItem.warehouseLocation) {
        const locIndex = locationStocks.findIndex((l: any) => l.location === bomItem.warehouseLocation);
        if (locIndex >= 0) {
          locationStocks[locIndex].stock = Math.max(
            0,
            parseFloat(locationStocks[locIndex].stock || "0") - consumedQty
          ).toFixed(3);
        }
      }

      await client.query(
        `UPDATE ${masterTable} 
         SET current_stock = $1, location_stocks = $2 
         WHERE id = $3`,
        [newMasterStock.toFixed(3), JSON.stringify(locationStocks), bomItem.materialId]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`    ❌ Failed to update inventory for ${bomItem.materialCode}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Seeder for Consumption Log Entries
 * Creates consumption entries for all completed swatch orders based on BOM items
 */
export async function seedSwatchConsumptionLog() {
  console.log("🌱 Starting Swatch Consumption Log Seeder...");

  try {
    // 1. Get all completed swatch orders
    const completedOrders = await db
      .select()
      .from(swatchOrdersTable)
      .where(and(
        eq(swatchOrdersTable.orderStatus, "Completed"),
        eq(swatchOrdersTable.isDeleted, false)
      ));

    console.log(`📦 Found ${completedOrders.length} completed swatch orders`);

    if (completedOrders.length === 0) {
      console.log("⚠️ No completed swatch orders found. Skipping...");
      return;
    }

    // 2. Get a system user
    const systemUser = await db
      .select()
      .from(usersTable)
      .limit(1);

    const consumedBy = systemUser.length > 0 ? systemUser[0].email : "system@zarierp.com";
    console.log(`👤 Using user: ${consumedBy}`);

    let totalConsumed = 0;
    let totalErrors = 0;
    let totalSkipped = 0;

    // 3. Process each completed order
    for (const order of completedOrders) {
      console.log(`\n📋 Processing Order #${order.id}: ${order.orderCode} - ${order.swatchName}`);

      // Parse dates
      const completionDate = parseDate(order.actualCompletionDate);
      const orderStartDate = parseDate(order.orderIssueDate);
      
      console.log(`  📅 Order issue date: ${orderStartDate.toISOString().split('T')[0]}`);
      console.log(`  📅 Order completion date: ${completionDate.toISOString().split('T')[0]}`);

      // Get all BOM items for this order
      const bomItems = await db
        .select()
        .from(swatchBomTable)
        .where(and(
          eq(swatchBomTable.swatchOrderId, order.id),
          eq(swatchBomTable.isDeleted, false)
        ));

      if (bomItems.length === 0) {
        console.log(`  ⚠️ No BOM items found for Order #${order.id}`);
        continue;
      }

      console.log(`  📦 Found ${bomItems.length} BOM items`);

      // Process each BOM item
      for (const bomItem of bomItems) {
        try {
          const requiredQty = parseFloat(bomItem.requiredQty || "0");
          const alreadyConsumed = parseFloat(bomItem.consumedQty || "0");
          const remainingToConsume = Math.max(0, requiredQty - alreadyConsumed);

          console.log(`\n  🔍 BOM Item: ${bomItem.materialCode} (${bomItem.materialName})`);
          console.log(`    Required: ${requiredQty}, Already Consumed: ${alreadyConsumed}, Remaining: ${remainingToConsume}`);

          if (remainingToConsume <= 0.001) {
            console.log(`    ⏭️  Already fully consumed`);
            totalSkipped++;
            continue;
          }

          // Check stock availability
          const masterTable = bomItem.materialType === "fabric" ? "fabrics" : "materials";
          
          let availableStock = 0;
          let locationStock = 0;
          let masterTableRow = null;
          
          // Query current stock from master table
          const stockQuery = `
            SELECT current_stock, location_stocks 
            FROM ${masterTable} 
            WHERE id = $1 AND is_deleted = false
          `;
          const stockResult = await pool.query(stockQuery, [bomItem.materialId]);

          if (stockResult.rows.length > 0) {
            masterTableRow = stockResult.rows[0];
            availableStock = parseFloat(masterTableRow.current_stock || "0");
            console.log(`    Available stock (total): ${availableStock}`);
            
            // Check location-specific stock
            if (bomItem.warehouseLocation) {
              const locationStocks = masterTableRow.location_stocks || [];
              const locationMatch = locationStocks.find(
                (l: any) => l.location === bomItem.warehouseLocation
              );
              if (locationMatch) {
                locationStock = parseFloat(locationMatch.stock || "0");
                console.log(`    Available stock at ${bomItem.warehouseLocation}: ${locationStock}`);
              } else {
                console.log(`    ⚠️ Location ${bomItem.warehouseLocation} not found in stock`);
              }
            }
          } else {
            console.log(`    ⚠️ No record found in ${masterTable} for material ID ${bomItem.materialId}`);
          }

          // Determine max consumable
          const maxConsumable = Math.min(
            remainingToConsume,
            locationStock > 0 ? locationStock : availableStock
          );

          console.log(`    Max consumable: ${maxConsumable}`);

          if (maxConsumable <= 0.001) {
            console.log(`    ⚠️  Insufficient stock. Skipping...`);
            totalSkipped++;
            continue;
          }

          // Calculate date range
          const startDate = new Date(orderStartDate);
          const endDate = new Date(completionDate);
          
          if (startDate >= endDate) {
            startDate.setDate(endDate.getDate() - 30);
          }

          // Generate consumption entries
          const chunkSize = Math.min(100, maxConsumable);
          const numberOfEntries = Math.ceil(maxConsumable / chunkSize);
          
          console.log(`    Creating ${numberOfEntries} consumption entries with chunk size ${chunkSize}`);

          for (let i = 0; i < numberOfEntries; i++) {
            const qtyForThisEntry = Math.min(
              chunkSize,
              maxConsumable - (i * chunkSize)
            );

            if (qtyForThisEntry <= 0.001) break;

            const consumptionDate = getRandomDateBetween(startDate, endDate);

            // Create consumption log entry
            const [consumptionEntry] = await db
              .insert(consumptionLogTable)
              .values({
                swatchOrderId: order.id,
                styleOrderId: null,
                styleOrderProductId: null,
                styleOrderProductName: null,
                bomRowId: bomItem.id,
                materialCode: bomItem.materialCode,
                materialName: bomItem.materialName,
                materialType: bomItem.materialType,
                unitType: bomItem.unitType || "Piece",
                consumedQty: qtyForThisEntry.toFixed(3),
                consumedBy: consumedBy,
                notes: "Swatchorder Consumption",
                warehouseLocation: bomItem.warehouseLocation || null,
                consumedAt: consumptionDate,
                createdAt: consumptionDate,
              })
              .returning();

            totalConsumed++;
            console.log(`    ✅ Entry ${i+1}/${numberOfEntries}: Consumed ${qtyForThisEntry.toFixed(3)} on ${consumptionDate.toISOString().split('T')[0]}`);

            // Update BOM consumed quantity
            const newConsumedTotal = alreadyConsumed + (i * chunkSize) + qtyForThisEntry;
            await db
              .update(swatchBomTable)
              .set({
                consumedQty: newConsumedTotal.toFixed(3),
                updatedBy: consumedBy,
                updatedAt: new Date(),
              })
              .where(eq(swatchBomTable.id, bomItem.id));

            // Sync with inventory
            await updateInventoryDirectly(
              bomItem,
              qtyForThisEntry,
              consumptionEntry.id,
              consumedBy
            );
          }

        } catch (error) {
          console.error(`    ❌ Error processing BOM ${bomItem.materialCode}:`, error);
          totalErrors++;
        }
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`📊 Summary:`);
    console.log(`   ✅ Consumption entries created: ${totalConsumed}`);
    console.log(`   ⏭️  Skipped (no stock/fully consumed): ${totalSkipped}`);
    console.log(`   ❌ Errors: ${totalErrors}`);

    // Verify entries were created
    const totalEntries = await db
      .select()
      .from(consumptionLogTable)
      .where(eq(consumptionLogTable.isDeleted, false));

    console.log(`\n📊 Total consumption logs in database: ${totalEntries.length}`);

  } catch (error) {
    console.error("❌ Seeder failed:", error);
    throw error;
  }
}

// For direct execution in ES modules
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedSwatchConsumptionLog()
    .then(() => {
      console.log("\n🎉 Seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Seeder failed:", error);
      process.exit(1);
    });
}