import type { ClientDatabaseConnection as PoolClient } from "@workspace/db";
import type { z } from "zod";
import type { GetClientAccountOrderResponse, ListClientAccountOrdersResponse, GetClientAccountDashboardResponse } from "@workspace/api-zod";
import { ClientAccessError } from "./clientAccounts";
import { readInvoiceBalances } from "./invoiceBalances";
type ClientAccountOrderContent = z.infer<typeof GetClientAccountOrderResponse>["data"];
type ClientAccountInvoice = ClientAccountOrderContent["invoices"][number];
type ClientAccountOrder = z.infer<typeof ListClientAccountOrdersResponse>["data"][number];
type ClientAccountDashboard = z.infer<typeof GetClientAccountDashboardResponse>;

// Link IDs remain the public account identifiers. An order with several published
// links is counted once; its oldest eligible link is the stable list destination.
export const visibleLinks = `FROM client_links l
 LEFT JOIN swatch_orders sw ON sw.id=l.swatch_order_id AND sw.is_deleted=false
 LEFT JOIN style_orders st ON st.id=l.style_order_id AND st.is_deleted=false
 WHERE l.is_deleted=false AND l.is_published=true
 AND ((sw.client_id=$1 AND l.style_order_id IS NULL) OR (st.client_id=$1 AND l.swatch_order_id IS NULL))`;

export async function ownedLink(cx: PoolClient, clientId: number, id: number) {
  const { rows: [link] } = await cx.query(`SELECT l.id,l.portal_title,l.hidden_images,l.closed_threads,
    l.swatch_order_id,l.style_order_id ${visibleLinks} AND l.id=$2 FOR UPDATE OF l`, [String(clientId), id]);
  if (!link) throw new ClientAccessError(404, "Published order not found");
  return link;
}

export async function activeLink(cx: PoolClient, id: number, published = false) {
  const { rows: [link] } = await cx.query(`SELECT l.id,l.client_id,l.portal_title,l.hidden_images,l.closed_threads,l.swatch_order_id,l.style_order_id
    FROM client_links l
    LEFT JOIN swatch_orders sw ON sw.id=l.swatch_order_id AND sw.is_deleted=false
    LEFT JOIN style_orders st ON st.id=l.style_order_id AND st.is_deleted=false
    WHERE l.id=$1 AND l.is_deleted=false ${published ? "AND l.is_published=true" : ""}
    AND ((sw.id IS NOT NULL AND l.style_order_id IS NULL) OR (st.id IS NOT NULL AND l.swatch_order_id IS NULL))
    FOR UPDATE OF l`, [id]);
  if (!link) throw new ClientAccessError(404, "Order link not found");
  return link;
}

export const orderInfo = (link: any) => ({
  swatch: link.swatch_order_id != null,
  orderId: link.swatch_order_id ?? link.style_order_id,
  type: link.swatch_order_id != null ? "Swatch" : "Style",
});

const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}

// Never project arbitrary jsonb objects or documents. Only known image fields.
export function images(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter(x => x && typeof x.data === "string" &&
    (/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=\r\n]+$/.test(x.data) || safeUrl(x.data) ||
      /^\/api\/uploads\/[A-Za-z0-9_./%-]+$/.test(x.data)) &&
    (!x.type || /^image\/(png|jpeg|webp|gif)$/.test(x.type)))
    .map(x => ({ name: typeof x.name === "string" ? x.name : "Image", type: x.type || "image/jpeg", data: x.data, size: Number(x.size) || 0 }));
}

export async function invoicesFor(cx: PoolClient, clientId: number, type: string, orderId: number, code: string) {
  const { rows } = await cx.query(`SELECT id,invoice_no,invoice_date,due_date,currency_code,exchange_rate_snapshot
    FROM invoices WHERE is_deleted=false AND client_id=$1 AND invoice_direction='Client'
    AND invoice_status NOT IN ('Draft','Cancelled')
    AND ((${type === "Swatch" ? "swatch_order_id" : "style_order_id"}=$2)
      OR (reference_type=$3 AND reference_id IN ($2::text,$4))) ORDER BY invoice_date,id`, [clientId, orderId, type, code]);
  const result: (ClientAccountInvoice & { receivedBaseInr: number; outstandingBaseInr: number })[] = [];
  for (const inv of rows) {
    const b = await readInvoiceBalances(cx, inv.id);
    if (!b) continue;
    result.push({ id: inv.id, invoiceNo: inv.invoice_no, invoiceDate: inv.invoice_date,
      dueDate: inv.due_date || null, currency: inv.currency_code || "INR",
      total: b.totalAmount, received: b.receivedAmount, outstanding: b.pendingAmount,
      status: b.pendingAmount <= 0 ? "Paid" : b.receivedAmount > 0 ? "Partially Paid" : "Unpaid",
      receivedBaseInr: b.receivedBaseInr, outstandingBaseInr: b.outstandingBaseInr });
  }
  return result;
}

export async function shipmentsFor(cx: PoolClient, type: string, orderId: number) {
  const { rows } = await cx.query(`WITH owner AS (
      SELECT client_id,quantity FROM ${type === "Swatch" ? "swatch_orders" : "style_orders"} WHERE id=$2 AND is_deleted=false
    ), packed AS (
      SELECT pl.shipment_id,sum(pi.quantity) AS qty FROM packing_package_items pi
      JOIN packing_packages pp ON pp.id=pi.package_id AND pp.is_deleted=false
      JOIN packing_lists pl ON pl.id=pp.packing_list_id AND pl.is_deleted=false
      JOIN owner o ON pl.client_id::text=o.client_id
      WHERE pi.order_type=$1 AND pi.order_id=$2 AND pi.is_deleted=false AND pi.item_source='order'
      AND pl.shipment_id IS NOT NULL
      GROUP BY pl.shipment_id
    )
    SELECT s.id,s.shipment_status AS status,s.tracking_number AS "trackingNumber",
    s.tracking_url AS "trackingUrl",s.shipment_date::text AS "shipmentDate",
    s.expected_delivery_date::text AS "expectedDeliveryDate",s.actual_delivery_date::text AS "actualDeliveryDate",
    (s.reference_type=$1 AND s.reference_id=$2) AS direct,
    (SELECT quantity FROM owner) AS ordered_qty,p.qty AS packed_qty
    FROM order_shipping_details s LEFT JOIN packed p ON p.shipment_id=s.id
    WHERE s.is_deleted=false AND ((s.reference_type=$1 AND s.reference_id=$2)
      OR (s.reference_type='PackingList' AND p.shipment_id IS NOT NULL)) ORDER BY s.id`, [type, orderId]);
  // Packing-list shipments can represent only a subset of an order. Without
  // quantity evidence, do not claim the whole order has been delivered.
  const qty = Number(rows[0]?.ordered_qty);
  const partial = !rows.some(s => s.direct) && (!Number.isFinite(qty) || qty <= 0 || rows.reduce((n,s) => n + Number(s.packed_qty || 0),0) < qty);
  return rows.map(({direct: _, ordered_qty: _q, packed_qty: _p, ...s}) => ({
    ...s, status: partial && s.status === "Delivered" ? "Delivered (partial order)" : s.status, trackingUrl: safeUrl(s.trackingUrl) }));
}

export function shippingState(shipments: { status: string }[]) {
  if (!shipments.length) return "Not recorded";
  if (shipments.some(s => s.status === "Delivered (partial order)")) return "Partially delivered";
  const delivered = shipments.filter(s => s.status === "Delivered").length;
  return delivered === shipments.length ? "Delivered" : delivered ? "Partially delivered" :
    shipments.some(s => ["Shipped", "In Transit", "Dispatched", "Out for Delivery"].includes(s.status)) ? "In transit" :
    shipments.length === 1 ? shipments[0].status : "Multiple shipments pending";
}

export async function workspaceList(cx: PoolClient, clientId: number) {
  const { rows } = await cx.query(`SELECT DISTINCT ON (COALESCE(sw.id,st.id), (sw.id IS NOT NULL))
    l.id,l.portal_title AS "portalTitle",COALESCE(sw.order_code,st.order_code) AS "orderCode",
    COALESCE(sw.swatch_name,st.style_name) AS "orderName",
    COALESCE(sw.order_status,st.order_status) AS "orderStatus",
    COALESCE(sw.order_issue_date,st.order_issue_date) AS "orderDate",
    COALESCE(sw.delivery_date,st.delivery_date) AS "deliveryDate",
    COALESCE(sw.id,st.id) AS "orderId",CASE WHEN sw.id IS NOT NULL THEN 'swatch' ELSE 'style' END AS "orderType"
    ${visibleLinks} ORDER BY COALESCE(sw.id,st.id),(sw.id IS NOT NULL),l.id`, [String(clientId)]);
  const invoices = new Map<number, ClientAccountInvoice & { receivedBaseInr: number; outstandingBaseInr: number }>();
  const orders: ClientAccountOrder[] = [];
  for (const row of rows) {
    const type = row.orderType === "swatch" ? "Swatch" : "Style";
    const inv = await invoicesFor(cx, clientId, type, row.orderId, row.orderCode);
    inv.forEach(i => invoices.set(i.id, i));
    const ships = await shipmentsFor(cx, type, row.orderId);
    const { orderId: _, ...summary } = row;
    orders.push({ ...summary, orderStatus: row.orderStatus ?? "Not recorded", orderDate: row.orderDate || null, deliveryDate: row.deliveryDate || null,
      shippingStatus: shippingState(ships), paymentStatus: !inv.length ? "Not invoiced" :
        inv.every(i => i.outstanding <= 0) ? "Paid" : inv.some(i => i.received > 0) ? "Partially Paid" : "Unpaid",
      invoiceCount: inv.length, receivedInr: round(inv.reduce((n, i) => n + i.receivedBaseInr, 0)),
      outstandingInr: round(inv.reduce((n, i) => n + i.outstandingBaseInr, 0)) });
  }
  const unique = [...invoices.values()];
  const dashboard: ClientAccountDashboard = { ordersPlaced: orders.length,
    inProgress: orders.filter(o => o.shippingStatus !== "Delivered" && !["Draft","Cancelled"].includes(o.orderStatus)).length,
    delivered: orders.filter(o => o.shippingStatus === "Delivered").length,
    uninvoicedOrders: orders.filter(o => o.invoiceCount === 0).length,
    invoicesPaid: unique.filter(i => i.outstanding <= 0).length,
    invoicesPending: unique.filter(i => i.outstanding > 0).length,
    receivedInr: round(unique.reduce((n, i) => n + i.receivedBaseInr, 0)),
    outstandingInr: round(unique.reduce((n, i) => n + i.outstandingBaseInr, 0)), currency: "INR" };
  return { orders: orders.sort((a,b) => b.id-a.id), dashboard };
}

export async function workspaceDetail(cx: PoolClient, clientId: number, link: any): Promise<ClientAccountOrderContent> {
  const { swatch, orderId, type } = orderInfo(link);
  const { rows: [o] } = await cx.query(`SELECT order_code,${swatch ? "swatch_name" : "style_name"} AS order_name,
    description,order_status,order_issue_date,delivery_date,quantity,${swatch ? "fabric_name" : "fabric_type"} AS fabric_name,
    ${swatch ? "NULL" : "style_no"} AS style_no,actual_start_date,actual_completion_date,ref_images
    FROM ${swatch ? "swatch_orders" : "style_orders"} WHERE id=$1 AND is_deleted=false`, [orderId]);
  const { rows: products } = swatch ? { rows: [] } : await cx.query(`SELECT id,product_name AS "productName",
    product_status AS "productStatus",fabric_name AS "fabricName",ref_images
    FROM style_order_products WHERE style_order_id=$1 AND is_deleted=false ORDER BY id`, [orderId]);
  const { rows: artworks } = await cx.query(`SELECT id,artwork_code,artwork_name,ref_images,wip_images,final_images,
    ${swatch ? "NULL" : "style_order_product_id"} AS product_id
    FROM ${swatch ? "artworks" : "style_order_artworks"} WHERE ${swatch ? "swatch_order_id" : "style_order_id"}=$1
    AND is_deleted=false ${swatch ? "" : "AND (style_order_product_id IS NULL OR style_order_product_id IN (SELECT id FROM style_order_products WHERE style_order_id=$1 AND is_deleted=false))"} ORDER BY id`, [orderId]);
  const { rows: feedback } = await cx.query(`SELECT id,artwork_id,decision,comment,created_at FROM client_feedback
    WHERE client_link_id=$1 AND is_deleted=false ORDER BY created_at,id`, [link.id]);
  const { rows: messages } = await cx.query(`SELECT id,artwork_id AS "artworkId",target_type AS "targetType",
    product_id AS "productId",sender,message,attachment,created_at AS "createdAt"
    FROM client_messages WHERE client_link_id=$1 AND is_deleted=false ORDER BY created_at,id`, [link.id]);
  const artworkIds = new Set(artworks.map(a => a.id));
  const productIds = new Set(products.map(p => p.id));
  const hidden = link.hidden_images ?? [];
  const projected = artworks.map(a => ({
    id: a.id, artworkCode: a.artwork_code, artworkName: a.artwork_name, productId: a.product_id,
    referenceImages: images(a.ref_images),
    wipImages: images((a.wip_images ?? []).filter((_: unknown, i: number) => !hidden.some((h: any) => h.artworkId === a.id && h.imageType === "wip" && h.imageIndex === i))),
    finalImages: images((a.final_images ?? []).filter((_: unknown, i: number) => !hidden.some((h: any) => h.artworkId === a.id && h.imageType === "final" && h.imageIndex === i))),
    isClosed: (link.closed_threads ?? []).includes(a.id),
    decision: feedback.filter(f => f.artwork_id === a.id).at(-1)?.decision ?? null,
    feedback: feedback.filter(f => f.artwork_id === a.id).map(f => ({
      id: f.id, decision: f.decision, comment: f.comment,
      createdAt: f.created_at instanceof Date ? f.created_at.toISOString() : String(f.created_at),
    })),
  }));
  const shipments = await shipmentsFor(cx, type, orderId);
  const invoices = await invoicesFor(cx, clientId, type, orderId, o.order_code);
  return {
    link: { id: link.id, portalTitle: link.portal_title, orderType: swatch ? "swatch" : "style" },
    order: { orderCode: o.order_code, orderName: o.order_name, description: o.description, orderStatus: o.order_status ?? "Not recorded",
      orderDate: o.order_issue_date || null, deliveryDate: o.delivery_date || null, quantity: o.quantity,
      fabricName: o.fabric_name, styleNo: o.style_no, referenceImages: images(o.ref_images) },
    products: products.map(({ref_images, ...p}) => ({...p, referenceImages: images(ref_images)})),
    artworks: projected, invoices: invoices.map(({receivedBaseInr: _, outstandingBaseInr: _p, ...i}) => i), shipments,
    messages: messages.filter(m => m.targetType === "order" || (m.targetType === "product" && productIds.has(m.productId)) ||
      (m.targetType === "artwork" && artworkIds.has(m.artworkId))).map(m => ({
        ...m, createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
      })),
    progress: [
      { label: "Order", status: o.order_status === "Cancelled" ? "Cancelled" : "Placed", date: o.order_issue_date || null },
      { label: "Artwork", status: artworks.length ? `${artworks.length} artwork(s)` : "Not recorded", date: null },
      { label: "Approval", status: !artworks.length ? "Not recorded" : projected.every(a => a.decision === "Approve") ? "Approved" :
        projected.some(a => a.decision === "Rework") ? "Rework requested" : "Pending", date: null },
      { label: "Production", status: o.actual_completion_date || o.order_status === "Completed" ? "Completed (not delivery)" :
        o.actual_start_date || ["In Production","In Sampling"].includes(o.order_status) ? "In progress" : "Not recorded",
        date: o.actual_completion_date || o.actual_start_date || null },
      { label: "Shipment", status: shippingState(shipments), date: shipments.length && shipments.every(s => s.status === "Delivered") ?
        shipments.map(s => s.actualDeliveryDate).filter(Boolean).sort().at(-1) ?? null : null },
    ],
  };
}
