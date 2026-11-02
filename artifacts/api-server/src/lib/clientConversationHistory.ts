import type { ClientDatabaseConnection as PoolClient } from "@workspace/db";

/** One chronological order history, including legacy messages on sibling links.
 * Callers must authorize the order before calling this projection. */
export async function conversationHistory(cx: PoolClient, link: any) {
  const swatch = link.swatch_order_id != null;
  const orderId = link.swatch_order_id ?? link.style_order_id;
  const { rows } = await cx.query(`SELECT m.id,m.client_link_id AS "clientLinkId",m.artwork_id AS "artworkId",
    m.artwork_name AS "artworkName",m.target_type AS "targetType",m.product_id AS "productId",
    m.sender,m.message,m.attachment,m.created_at AS "createdAt"
    FROM client_messages m
    JOIN client_links l ON l.id=m.client_link_id AND l.is_deleted=false
    WHERE l.${swatch ? "swatch_order_id" : "style_order_id"}=$1
    AND l.${swatch ? "style_order_id" : "swatch_order_id"} IS NULL
    AND m.is_deleted=false AND (
      m.target_type='order'
      OR (m.target_type='product' AND $2=false AND EXISTS(SELECT 1 FROM style_order_products p
        WHERE p.id=m.product_id AND p.style_order_id=$1 AND p.is_deleted=false))
      OR (m.target_type='artwork' AND EXISTS(SELECT 1 FROM ${swatch ? "artworks" : "style_order_artworks"} a
        WHERE a.id=m.artwork_id AND a.${swatch ? "swatch_order_id" : "style_order_id"}=$1 AND a.is_deleted=false
        ${swatch ? "" : "AND (a.style_order_product_id IS NULL OR EXISTS(SELECT 1 FROM style_order_products p WHERE p.id=a.style_order_product_id AND p.style_order_id=$1 AND p.is_deleted=false))"})))
    ORDER BY m.created_at,m.id`, [orderId,swatch]);
  return rows;
}
