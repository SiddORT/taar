import type { ClientDatabaseConnection as PoolClient } from "@workspace/db";
import { SendClientAccountMessageBody as ClientConversationInput, SendClientAccountFeedbackBody as ClientArtworkDecisionInput } from "@workspace/api-zod";
import { ClientAccessError } from "./clientAccounts";
import { orderInfo } from "./clientWorkspace";

export const MAX_ATTACHMENT = 5 * 1024 * 1024;
const MIME = new Set(["image/jpeg","image/png","image/webp","image/gif","application/pdf","text/plain"]);

export async function conversationHistory(cx: PoolClient, link: any) {
  const { swatch, orderId } = orderInfo(link);
  const { rows } = await cx.query(`SELECT m.id,m.client_link_id AS "clientLinkId",m.artwork_id AS "artworkId",
    m.artwork_name AS "artworkName",m.target_type AS "targetType",m.product_id AS "productId",
    m.sender,m.message,m.attachment,m.created_at AS "createdAt"
    FROM client_messages m WHERE m.client_link_id=$1 AND m.is_deleted=false AND (
      m.target_type='order'
      OR (m.target_type='product' AND $3=false AND EXISTS(SELECT 1 FROM style_order_products p
        WHERE p.id=m.product_id AND p.style_order_id=$2 AND p.is_deleted=false))
      OR (m.target_type='artwork' AND EXISTS(SELECT 1 FROM ${swatch ? "artworks" : "style_order_artworks"} a
        WHERE a.id=m.artwork_id AND a.${swatch ? "swatch_order_id" : "style_order_id"}=$2 AND a.is_deleted=false
        ${swatch ? "" : "AND (a.style_order_product_id IS NULL OR EXISTS(SELECT 1 FROM style_order_products p WHERE p.id=a.style_order_product_id AND p.style_order_id=$2 AND p.is_deleted=false))"})))
    ORDER BY m.created_at,m.id`, [link.id,orderId,swatch]);
  return rows;
}
export function validateAttachment(value: any) {
  if (value == null) return null;
  if (typeof value !== "object" || typeof value.name !== "string" || !value.name.trim() || value.name.length > 180 ||
    /[\x00-\x1f/\\]/.test(value.name) || !MIME.has(value.type) || !Number.isInteger(value.size) || value.size < 1 ||
    value.size > MAX_ATTACHMENT || typeof value.data !== "string" || value.data.length > Math.ceil(MAX_ATTACHMENT / 3) * 4 + 100) {
    throw new ClientAccessError(400, "Use a JPEG, PNG, WebP, GIF, PDF or text file up to 5 MB.");
  }
  const prefix = `data:${value.type};base64,`;
  if (!value.data.startsWith(prefix)) throw new ClientAccessError(400, "Invalid attachment encoding");
  const encoded = value.data.slice(prefix.length);
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) throw new ClientAccessError(400, "Invalid attachment encoding");
  const bytes = Buffer.from(encoded, "base64");
  if (bytes.length !== value.size) throw new ClientAccessError(400, "Attachment size does not match");
  const signature = value.type === "image/jpeg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 :
    value.type === "image/png" ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) :
    value.type === "image/webp" ? bytes.toString("ascii",0,4) === "RIFF" && bytes.toString("ascii",8,12) === "WEBP" :
    value.type === "image/gif" ? ["GIF87a","GIF89a"].includes(bytes.toString("ascii",0,6)) :
    value.type === "application/pdf" ? bytes.toString("ascii",0,5) === "%PDF-" : !bytes.includes(0);
  if (!signature) throw new ClientAccessError(400, "File content does not match its type");
  return { name: value.name.trim(), type: value.type, data: value.data, size: bytes.length };
}

export async function conversationTarget(cx: PoolClient, link: any, targetType: string, targetId?: number, allowClosed = false) {
  const { swatch, orderId } = orderInfo(link);
  if (targetType === "order") {
    if (targetId != null) throw new ClientAccessError(400, "Order conversations do not need a target ID");
    return { artworkId: null, productId: null, name: "Order" };
  }
  if (!Number.isSafeInteger(targetId) || targetId! < 1) throw new ClientAccessError(400, "Select a valid conversation");
  if (targetType === "product") {
    if (swatch) throw new ClientAccessError(404, "Product not found");
    const { rows: [p] } = await cx.query(`SELECT id,product_name FROM style_order_products
      WHERE id=$1 AND style_order_id=$2 AND is_deleted=false`, [targetId, orderId]);
    if (!p) throw new ClientAccessError(404, "Product not found");
    return { artworkId: null, productId: p.id, name: p.product_name };
  }
  if (targetType !== "artwork") throw new ClientAccessError(400, "Invalid conversation type");
  const { rows: [a] } = await cx.query(`SELECT id,artwork_name FROM ${swatch ? "artworks" : "style_order_artworks"}
    WHERE id=$1 AND ${swatch ? "swatch_order_id" : "style_order_id"}=$2 AND is_deleted=false
    ${swatch ? "" : "AND (style_order_product_id IS NULL OR style_order_product_id IN (SELECT id FROM style_order_products WHERE style_order_id=$2 AND is_deleted=false))"}`, [targetId, orderId]);
  if (!a) throw new ClientAccessError(404, "Artwork not found");
  if (!allowClosed && (link.closed_threads ?? []).includes(a.id)) throw new ClientAccessError(403, "This artwork discussion is closed");
  return { artworkId: a.id, productId: null, name: a.artwork_name };
}

export async function sendConversation(cx: PoolClient, link: any, body: unknown, sender: "client" | "team", legacy = false) {
  const raw = body as any;
  const parsed = ClientConversationInput.safeParse(legacy && !raw?.targetType ? { ...raw, targetType: "artwork", targetId: raw?.artworkId } : body);
  if (!parsed.success) throw new ClientAccessError(400, "Choose a conversation and use up to 4000 characters.");
  const { targetType, targetId } = parsed.data;
  const target = await conversationTarget(cx, link, targetType, targetId);
  const message = parsed.data.message?.trim() || null;
  const attachment = validateAttachment(parsed.data.attachment);
  if (!message && !attachment) throw new ClientAccessError(400, "Enter a message or attach a file");
  const { rows: [created] } = await cx.query(`INSERT INTO client_messages
    (client_link_id,target_type,product_id,artwork_id,artwork_name,sender,message,attachment)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,client_link_id AS "clientLinkId",
    target_type AS "targetType",product_id AS "productId",artwork_id AS "artworkId",artwork_name AS "artworkName",
    sender,message,attachment,created_at AS "createdAt"`,
    [link.id,targetType,target.productId,target.artworkId,target.name,sender,message,attachment]);
  return created;
}

export async function decideArtwork(cx: PoolClient, link: any, body: unknown) {
  const parsed = ClientArtworkDecisionInput.safeParse(body);
  if (!parsed.success) throw new ClientAccessError(400, "Select an artwork and a valid decision");
  const { artworkId, decision, comment } = parsed.data;
  const target = await conversationTarget(cx, link, "artwork", artworkId);
  const { swatch, orderId } = orderInfo(link);
  const { rows: [created] } = await cx.query(`INSERT INTO client_feedback(client_link_id,artwork_id,artwork_name,decision,comment)
    VALUES($1,$2,$3,$4,$5) RETURNING id`, [link.id,artworkId,target.name,decision,comment?.trim() || null]);
  const closed: number[] = link.closed_threads ?? [];
  const updated = decision === "Approve" ? [...new Set([...closed, artworkId])] : closed;
  await cx.query(`UPDATE client_links SET closed_threads=$2,updated_at=now() WHERE id=$1 AND is_deleted=false`, [link.id,JSON.stringify(updated)]);
  await cx.query(`UPDATE ${swatch ? "artworks" : "style_order_artworks"} SET feedback_status=$2
    WHERE id=$1 AND ${swatch ? "swatch_order_id" : "style_order_id"}=$3 AND is_deleted=false`,
    [artworkId,decision === "Approve" ? "Approved" : "Pending",orderId]);
  // Retain the legacy swatch auto-completion/rework behavior; never call it delivery.
  if (swatch && decision === "Approve") {
    const { rows } = await cx.query(`SELECT id FROM artworks WHERE swatch_order_id=$1 AND is_deleted=false`, [orderId]);
    if (rows.length && rows.every(a => updated.includes(a.id))) await cx.query(`UPDATE swatch_orders
      SET order_status='Completed',updated_at=now() WHERE id=$1 AND is_deleted=false`, [orderId]);
  } else if (decision === "Rework") {
    await cx.query(`UPDATE ${swatch ? "swatch_orders" : "style_orders"} SET order_status=$2,updated_at=now()
      WHERE id=$1 AND is_deleted=false AND order_status IN ('Pending Approval','Completed')`,
      [orderId,swatch ? "In Artwork" : "In Review"]);
  }
  return created;
}
