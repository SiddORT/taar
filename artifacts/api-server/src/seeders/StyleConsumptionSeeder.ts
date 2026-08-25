// StyleConsumptionSeeder.ts

import { db } from "@workspace/db";
import { 
  styleOrdersTable,
  styleOrderProductsTable,
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
    // If no date, default to 30 days ago
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }
  
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    // If invalid date, default to 30 days ago
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
 * Directly update inventory tables for style consumption
 */
async function updateInventoryDirectly(
  bomItem: any,
  consumedQty: number,
  consumptionId: number,
  consumedBy: string,
  styleOrderId: number
) {
  const client = await (pool as any).connect();
  try {
    await client.query("BEGIN");

    // Find the inventory item
    const invResult = await client.query(
      `SELECT id, current_stock, style_reserved_qty, available_stock 
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

    // Update style_reserved_qty if there are active reservations
    const reservationResult = await client.query(
      `SELECT id, reserved_quantity FROM material_reservations
       WHERE inventory_id = $1 
       AND reservation_type = 'Style' 
       AND reference_id = $2 
       AND status = 'Active' 
       AND is_deleted = false
       ORDER BY id DESC LIMIT 1`,
      [inventoryId, styleOrderId]
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
           SET style_reserved_qty = GREATEST(0, style_reserved_qty::numeric - $1)
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
           SET style_reserved_qty = GREATEST(0, style_reserved_qty::numeric - $1)
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
       VALUES ($1, 'consumption', $2, 'Style', $3, $4, $5, $6, $7, $8)`,
      [
        inventoryId,
        String(styleOrderId),
        0,
        consumedQty,
        newBalance.rows[0].current_stock,
        `Consumption from Style Order #${styleOrderId} (log #${consumptionId})`,
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
 * Seeder for Style Consumption Log Entries
 * Creates consumption entries for all completed style orders based on BOM items
 * Consumption is logged against style order products
 */
export async function seedStyleConsumptionLog() {
  console.log("🌱 Starting Style Consumption Log Seeder...");

  try {
    // 1. Get all completed style orders
    const completedOrders = await db
      .select()
      .from(styleOrdersTable)
      .where(and(
        eq(styleOrdersTable.orderStatus, "Completed"),
        eq(styleOrdersTable.isDeleted, false)
      ));

    console.log(`📦 Found ${completedOrders.length} completed style orders`);

    if (completedOrders.length === 0) {
      console.log("⚠️ No completed style orders found. Skipping...");
      return;
    }

    // 2. Get a system user to attribute the consumption
    const systemUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, "admin@zarierp.com"))
      .limit(1);

    const consumedBy = systemUser.length > 0 ? systemUser[0].email : "system@zarierp.com";
    console.log(`👤 Using user: ${consumedBy}`);

    let totalConsumed = 0;
    let totalErrors = 0;

    // 3. Process each completed order
    for (const order of completedOrders) {
      console.log(`\n📋 Processing Order #${order.id}: ${order.orderCode} - ${order.styleName}`);

      // Parse completion date - this will be used as the upper bound for consumption dates
      const completionDate = parseDate(order.actualCompletionDate);
      console.log(`  📅 Order completed on: ${completionDate.toISOString().split('T')[0]}`);

      // Get order issue date as the lower bound (or use a default date)
      const orderStartDate = parseDate(order.orderIssueDate);
      
      // Get all products for this style order
      const orderProducts = await db
        .select()
        .from(styleOrderProductsTable)
        .where(and(
          eq(styleOrderProductsTable.styleOrderId, order.id),
          eq(styleOrderProductsTable.isDeleted, false)
        ));

      if (orderProducts.length === 0) {
        console.log(`  ⚠️ No products found for Order #${order.id}`);
        continue;
      }

      console.log(`  📦 Found ${orderProducts.length} products`);

      // Process each product
      for (const product of orderProducts) {
        console.log(`\n  📋 Processing Product: ${product.productName} (ID: ${product.id})`);

        // Get BOM items for this product (BOM is linked to swatchBomTable with swatchOrderId = styleOrderId)
        const bomItems = await db
          .select()
          .from(swatchBomTable)
          .where(and(
            eq(swatchBomTable.styleOrderId, order.id),
            eq(swatchBomTable.isDeleted, false)
          ));

        if (bomItems.length === 0) {
          console.log(`    ⚠️ No BOM items found for product ${product.productName}`);
          continue;
        }

        console.log(`    📦 Found ${bomItems.length} BOM items for product`);

        // Process each BOM item
        for (const bomItem of bomItems) {
          try {
            const requiredQty = parseFloat(bomItem.requiredQty || "0");
            const alreadyConsumed = parseFloat(bomItem.consumedQty || "0");
            const remainingToConsume = Math.max(0, requiredQty - alreadyConsumed);

            if (remainingToConsume <= 0.001) {
              console.log(`      ⏭️  BOM ${bomItem.materialCode} (${bomItem.materialName}): Already fully consumed (${alreadyConsumed}/${requiredQty})`);
              continue;
            }

            // Check if we have enough stock at the warehouse location
            const masterTable = bomItem.materialType === "fabric" ? "fabrics" : "materials";
            
            let availableStock = 0;
            let locationStock = 0;
            
            // Query current stock from master table
            const stockQuery = `
              SELECT current_stock, location_stocks 
              FROM ${masterTable} 
              WHERE id = $1 AND is_deleted = false
            `;
            const stockResult = await pool.query(stockQuery, [bomItem.materialId]);

            if (stockResult.rows.length > 0) {
              const row = stockResult.rows[0];
              availableStock = parseFloat(row.current_stock || "0");
              
              // Check location-specific stock
              if (bomItem.warehouseLocation) {
                const locationStocks = row.location_stocks || [];
                const locationMatch = locationStocks.find(
                  (l: any) => l.location === bomItem.warehouseLocation
                );
                if (locationMatch) {
                  locationStock = parseFloat(locationMatch.stock || "0");
                }
              }
            }

            // Determine how much we can consume (limited by available stock)
            const maxConsumable = Math.min(
              remainingToConsume,
              locationStock > 0 ? locationStock : availableStock
            );

            if (maxConsumable <= 0.001) {
              console.log(`      ⚠️  Insufficient stock for ${bomItem.materialCode} (${bomItem.materialName}). Required: ${remainingToConsume}, Available: ${availableStock}, Location: ${locationStock}`);
              totalErrors++;
              continue;
            }

            // Generate consumption entries
            const chunkSize = Math.min(100, maxConsumable);
            const numberOfEntries = Math.ceil(maxConsumable / chunkSize);

            // Calculate the date range for consumption entries
            // We want entries to be spread between order issue date and completion date
            const startDate = new Date(orderStartDate);
            const endDate = new Date(completionDate);
            
            // If start and end are the same or start is after end, adjust
            if (startDate >= endDate) {
              // Set start to 30 days before completion
              startDate.setDate(endDate.getDate() - 30);
            }

            for (let i = 0; i < numberOfEntries; i++) {
              const qtyForThisEntry = Math.min(
                chunkSize,
                maxConsumable - (i * chunkSize)
              );

              if (qtyForThisEntry <= 0.001) break;

              // Generate a random consumption date between start and end date
              // Spread the consumption entries across the order timeline
              const consumptionDate = getRandomDateBetween(startDate, endDate);

              // Create consumption log entry with style order product details
              const [consumptionEntry] = await db
                .insert(consumptionLogTable)
                .values({
                  swatchOrderId: null,
                  styleOrderId: order.id,
                  styleOrderProductId: product.id,
                  styleOrderProductName: product.productName,
                  bomRowId: bomItem.id,
                  materialCode: bomItem.materialCode,
                  materialName: bomItem.materialName,
                  materialType: bomItem.materialType,
                  unitType: bomItem.unitType || "Piece",
                  consumedQty: qtyForThisEntry.toFixed(3),
                  consumedBy: consumedBy,
                  notes: "Style order Consmption",
                  warehouseLocation: bomItem.warehouseLocation || null,
                  consumedAt: consumptionDate, // Set the consumption date
                  createdAt: consumptionDate, // Set the creation date to match consumption date
                })
                .returning();

              totalConsumed++;
              console.log(`      ✅ Consumed ${qtyForThisEntry.toFixed(3)} ${bomItem.unitType} of ${bomItem.materialCode} (${bomItem.materialName}) on ${consumptionDate.toISOString().split('T')[0]}`);

              // Update the BOM's consumed quantity
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
                consumedBy,
                order.id
              );
            }

          } catch (error) {
            console.error(`      ❌ Error processing BOM ${bomItem.materialCode}:`, error);
            totalErrors++;
          }
        }
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`📊 Total consumption entries created: ${totalConsumed}`);
    console.log(`⚠️ Errors encountered: ${totalErrors}`);

  } catch (error) {
    console.error("❌ Seeder failed:", error);
    throw error;
  }
}

// For direct execution in ES modules
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedStyleConsumptionLog()
    .then(() => {
      console.log("\n🎉 Seeder completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Seeder failed:", error);
      process.exit(1);
    });
}