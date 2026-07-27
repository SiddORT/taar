import { pool } from "@workspace/db";

export type InventorySourceType = "fabric" | "material" | "packaging";

export interface InventoryAutoCreateData {
  itemName: string;
  itemCode: string;
  category?: string | null;
  department?: string | null;
  warehouseLocation?: string | null;
  unitType?: string | null;
  averagePrice?: string | number | null;
  preferredVendor?: string | null;
  images?: { id: string; name: string; url: string; size: number }[] | null;
  currentStock?: string | number | null;
  reorderLevel?: string | number | null;
  minimumLevel?: string | number | null;
  maximumLevel?: string | number | null;
}

export interface InventoryAutoUpdateData {
  itemName?: string | null;
  itemCode?: string | null;
  category?: string | null;
  department?: string | null;
  warehouseLocation?: string | null;
  unitType?: string | null;
  currentStock?: string | number | null;
  availableStock?: number | null;
  averagePrice?: string | number | null;
  lastPurchasePrice?: number | null;
  minimumLevel?: string | null;
  reorderLevel?: string | null;
  maximumLevel?: string | null;
  preferredVendor?: string | null;
  images?: { id: string; name: string; url: string; size: number }[] | null;
}
export async function ensureInventoryRecord(
  sourceType: InventorySourceType,
  sourceId: number,
  data: InventoryAutoCreateData
): Promise<void> {
  try {
    const avgPrice = data.averagePrice ? (parseFloat(String(data.averagePrice)) || 0) : 0;
    const images = JSON.stringify(data.images ?? []);
    const currentStock = data.currentStock !== undefined ? parseFloat(String(data.currentStock)) || 0 : 0;
    const reorderLevel = data.reorderLevel !== undefined ? parseFloat(String(data.reorderLevel)) || 0 : 0;
    const minimumLevel = data.minimumLevel !== undefined ? parseFloat(String(data.minimumLevel)) || 0 : 0;
    const maximumLevel = data.maximumLevel !== undefined ? parseFloat(String(data.maximumLevel)) || 0 : 0;

    await pool.query(
      `INSERT INTO inventory_items (
        source_type, source_id, item_name, item_code, category, department,
        warehouse_location, unit_type, current_stock, style_reserved_qty,
        swatch_reserved_qty, available_stock, average_price, last_purchase_price,
        minimum_level, reorder_level, maximum_level, preferred_vendor, images,
        last_updated_at, created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,0,0,$9,$10,0,$11,$12,$13,$14,$15,NOW(),NOW())
      ON CONFLICT (source_type, source_id)
      DO UPDATE SET
        images = EXCLUDED.images,
        last_updated_at = NOW()`,
      [
        sourceType, 
        sourceId, data.itemName, 
        data.itemCode, data.category ?? null, 
        data.department ?? null, 
        data.warehouseLocation ?? null, 
        data.unitType ?? null, 
        currentStock, 
        avgPrice, 
        minimumLevel, 
        reorderLevel, 
        maximumLevel, 
        data.preferredVendor ?? null, 
        images
      ]
    );
  } catch (err) {
    console.error("[InventoryService] Failed to create inventory record:", err);
  }
}

export async function updateInventoryImages(
  sourceType: InventorySourceType,
  sourceId: number,
  images: { id: string; name: string; url: string; size: number }[]
): Promise<void> {
  try {
    await pool.query(
      `UPDATE inventory_items SET images = $1, last_updated_at = NOW()
       WHERE source_type = $2 AND source_id = $3`,
      [JSON.stringify(images), sourceType, sourceId]
    );
  } catch (err) {
    console.error("[InventoryService] Failed to update inventory images:", err);
  }
}

/**
 * Appends a single image to an inventory item and propagates back to its source master
 * (fabric/material). Packaging_materials has no images column so only inventory_items is
 * updated. Returns the updated images array.
 */
export async function appendImageToInventoryAndMaster(
  inventoryItemId: number,
  image: { id: string; name: string; url: string; size: number }
): Promise<{ id: string; name: string; url: string; size: number }[]> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const invRes = await client.query(
      `SELECT source_type, source_id, images FROM inventory_items WHERE id = $1 FOR UPDATE`,
      [inventoryItemId]
    );
    if (!invRes.rows.length) {
      await client.query("ROLLBACK");
      throw new Error("Inventory item not found");
    }
    const row = invRes.rows[0] as { source_type: InventorySourceType; source_id: number; images: unknown };
    const current = Array.isArray(row.images)
      ? (row.images as { id: string; name: string; url: string; size: number }[])
      : [];
    const next = [...current, image];
    const nextJson = JSON.stringify(next);

    await client.query(
      `UPDATE inventory_items SET images = $1, last_updated_at = NOW() WHERE id = $2`,
      [nextJson, inventoryItemId]
    );

    if (row.source_type === "fabric") {
      await client.query(
        `UPDATE fabrics SET images = $1, updated_at = NOW() WHERE id = $2`,
        [nextJson, row.source_id]
      );
    } else if (row.source_type === "material") {
      await client.query(
        `UPDATE materials SET images = $1, updated_at = NOW() WHERE id = $2`,
        [nextJson, row.source_id]
      );
    }
    await client.query("COMMIT");
    return next;
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch { /* ignore */ }
    throw err;
  } finally {
    client.release();
  }
}

export async function updateInventoryStockLevels(
  sourceType: InventorySourceType,
  sourceId: number,
  data: InventoryAutoUpdateData
): Promise<void> {
  try {
    await pool.query(
      `
      UPDATE inventory_items
      SET
        item_name = COALESCE($3, item_name),
        item_code = COALESCE($4, item_code),
        category = COALESCE($5, category),
        department = COALESCE($6, department),
        warehouse_location = COALESCE($7, warehouse_location),
        unit_type = COALESCE($8, unit_type),
        current_stock = COALESCE($9, current_stock),
        available_stock = COALESCE($10, available_stock),
        average_price = COALESCE($11, average_price),
        last_purchase_price = COALESCE($12, last_purchase_price),
        minimum_level = COALESCE(NULLIF($13, '')::numeric, minimum_level),
        reorder_level = COALESCE(NULLIF($14, '')::numeric, reorder_level),
        maximum_level = COALESCE(NULLIF($15, '')::numeric, maximum_level),
        preferred_vendor = COALESCE($16, preferred_vendor),
        images = COALESCE($17, images),
        last_updated_at = NOW()
      WHERE source_type = $1
        AND source_id = $2
      `,
      [
        sourceType,
        sourceId,
        data.itemName ?? null,
        data.itemCode ?? null,
        data.category ?? null,
        data.department ?? null,
        data.warehouseLocation ?? null,
        data.unitType ?? null,
        data.currentStock ?? null,
        data.availableStock ?? null,
        data.averagePrice ?? null,
        data.lastPurchasePrice ?? null,
        data.minimumLevel ?? "",
        data.reorderLevel ?? "",
        data.maximumLevel ?? "",
        data.preferredVendor ?? null,
        data.images ?? null,
      ]
    );
  } catch (err) {
    console.error("[InventoryService] Failed to update inventory item:", err);
    throw err;
  }
}

export async function syncAllFromMasters(): Promise<{ synced: number; updated: number }> {
  try {
    const [fNew, mNew, pNew] = await Promise.all([
      pool.query(`
        INSERT INTO inventory_items
          (source_type, source_id, item_name, item_code, category, unit_type,
           warehouse_location, average_price, last_purchase_price, preferred_vendor,
           current_stock, available_stock, last_updated_at, created_at)
        SELECT
          'fabric', f.id,
          TRIM(CONCAT(f.fabric_type, ' - ', f.quality, ' - ', f.color_name)),
          f.fabric_code, f.fabric_type, f.unit_type,
          f.location,
          COALESCE(NULLIF(TRIM(f.price_per_meter),'')::numeric, 0),
          COALESCE(NULLIF(TRIM(f.price_per_meter),'')::numeric, 0),
          f.vendor,
          COALESCE(NULLIF(TRIM(COALESCE(f.current_stock,'0')),'')::numeric, 0),
          COALESCE(NULLIF(TRIM(COALESCE(f.current_stock,'0')),'')::numeric, 0),
          NOW(), NOW()
        FROM fabrics f
        WHERE f.is_deleted = false
        ON CONFLICT (source_type, source_id) DO NOTHING
        RETURNING id
      `),
      pool.query(`
        INSERT INTO inventory_items
          (source_type, source_id, item_name, item_code, category, unit_type,
           warehouse_location, average_price, last_purchase_price, preferred_vendor,
           current_stock, available_stock, last_updated_at, created_at)
        SELECT
          'material', m.id,
          TRIM(CONCAT(m.item_type, ' - ', m.quality, ' - ', m.color_name)),
          m.material_code, m.item_type, m.unit_type,
          m.location,
          COALESCE(NULLIF(TRIM(m.unit_price),'')::numeric, 0),
          COALESCE(NULLIF(TRIM(m.unit_price),'')::numeric, 0),
          m.vendor,
          COALESCE(NULLIF(TRIM(COALESCE(m.current_stock,'0')),'')::numeric, 0),
          COALESCE(NULLIF(TRIM(COALESCE(m.current_stock,'0')),'')::numeric, 0),
          NOW(), NOW()
        FROM materials m
        WHERE m.is_deleted = false
        ON CONFLICT (source_type, source_id) DO NOTHING
        RETURNING id
      `),
      pool.query(`
        INSERT INTO inventory_items
          (source_type, source_id, item_name, item_code, category, unit_type,
           warehouse_location, average_price, last_purchase_price, preferred_vendor,
           current_stock, available_stock, last_updated_at, created_at)
        SELECT
          'packaging', p.id,
          p.item_name,
          p.item_code, p.item_type, p.unit_type,
          p.location,
          COALESCE(p.unit_price, 0),
          COALESCE(p.unit_price, 0),
          p.vendor,
          COALESCE(p.current_stock, 0),
          COALESCE(p.current_stock, 0),
          NOW(), NOW()
        FROM packaging_materials p
        WHERE p.is_deleted = false
        ON CONFLICT (source_type, source_id) DO NOTHING
        RETURNING id
      `),
    ]);

    const [fUpd, mUpd, pUpd] = await Promise.all([
      pool.query(`
        UPDATE inventory_items ii
        SET
          current_stock   = COALESCE(NULLIF(TRIM(COALESCE(f.current_stock,'0')),'')::numeric, 0),
          available_stock = GREATEST(0,
            COALESCE(NULLIF(TRIM(COALESCE(f.current_stock,'0')),'')::numeric, 0)
            - ii.style_reserved_qty::numeric - ii.swatch_reserved_qty::numeric
          ),
          item_name       = TRIM(CONCAT(f.fabric_type, ' - ', f.quality, ' - ', f.color_name)),
          item_code       = f.fabric_code,
          average_price   = COALESCE(NULLIF(TRIM(f.price_per_meter),'')::numeric, ii.average_price),
          last_updated_at = NOW()
        FROM fabrics f
        WHERE ii.source_type = 'fabric' AND ii.source_id = f.id AND f.is_deleted = false
        RETURNING ii.id
      `),
      pool.query(`
        UPDATE inventory_items ii
        SET
          current_stock   = COALESCE(NULLIF(TRIM(COALESCE(m.current_stock,'0')),'')::numeric, 0),
          available_stock = GREATEST(0,
            COALESCE(NULLIF(TRIM(COALESCE(m.current_stock,'0')),'')::numeric, 0)
            - ii.style_reserved_qty::numeric - ii.swatch_reserved_qty::numeric
          ),
          item_name       = TRIM(CONCAT(m.item_type, ' - ', m.quality, ' - ', m.color_name)),
          item_code       = m.material_code,
          average_price   = COALESCE(NULLIF(TRIM(m.unit_price),'')::numeric, ii.average_price),
          last_updated_at = NOW()
        FROM materials m
        WHERE ii.source_type = 'material' AND ii.source_id = m.id AND m.is_deleted = false
        RETURNING ii.id
      `),
      pool.query(`
        UPDATE inventory_items ii
        SET
          current_stock   = COALESCE(p.current_stock, 0),
          available_stock = GREATEST(0,
            COALESCE(p.current_stock, 0)
            - ii.style_reserved_qty::numeric - ii.swatch_reserved_qty::numeric
          ),
          item_name       = p.item_name,
          item_code       = p.item_code,
          average_price   = COALESCE(p.unit_price, ii.average_price),
          last_updated_at = NOW()
        FROM packaging_materials p
        WHERE ii.source_type = 'packaging' AND ii.source_id = p.id AND p.is_deleted = false
        RETURNING ii.id
      `),
    ]);

    const newCount = (fNew.rowCount ?? 0) + (mNew.rowCount ?? 0) + (pNew.rowCount ?? 0);
    const updCount = (fUpd.rowCount ?? 0) + (mUpd.rowCount ?? 0) + (pUpd.rowCount ?? 0);
    return { synced: newCount, updated: updCount };
  } catch (err) {
    console.error("[InventoryService] Sync failed:", err);
    throw err;
  }
}
