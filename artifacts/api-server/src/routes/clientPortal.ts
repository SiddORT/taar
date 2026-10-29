import { Router } from "express";
import { transaction, ClientAccessError, throttle } from "../lib/clientAccounts";
import { clientHandler } from "./clientAuth";
import { activeLink, orderInfo, workspaceDetail, visibleLinks } from "../lib/clientWorkspace";
import { decideArtwork, sendConversation } from "../lib/clientConversations";

const router = Router();
async function tokenLink(cx: import("@workspace/db").ClientDatabaseConnection, token: unknown) {
  if (typeof token !== "string" || !token || token.length > 128) throw new ClientAccessError(404, "Link not found");
  const { rows: [row] } = await cx.query("SELECT id,is_published FROM client_links WHERE token=$1 AND is_deleted=false", [token]);
  if (!row) throw new ClientAccessError(404, "Link not found");
  if (!row.is_published) throw new ClientAccessError(403, "This link is not yet published");
  return activeLink(cx, row.id, true);
}

router.get("/client-portal/:token", clientHandler(async (req, res) => {
  const data = await transaction(async cx => {
    const link = await tokenLink(cx, req.params.token);
    const { swatch, orderId } = orderInfo(link);
    const { rows: [o] } = await cx.query(`SELECT client_id,client_name,priority,is_chargeable,department
      FROM ${swatch ? "swatch_orders" : "style_orders"} WHERE id=$1 AND is_deleted=false`, [orderId]);
    const detail = await workspaceDetail(cx, Number(o.client_id), link);
    const { rows: statuses } = await cx.query(`SELECT id,feedback_status FROM ${swatch ? "artworks" : "style_order_artworks"}
      WHERE ${swatch ? "swatch_order_id" : "style_order_id"}=$1 AND is_deleted=false`, [orderId]);
    // Preserve legacy shape without exposing internal notes, costing or account invoices.
    return { link: { ...detail.link, token: req.params.token },
      order: { id: orderId, ...detail.order, swatchName: swatch ? detail.order.orderName : "",
        styleName: swatch ? "" : detail.order.orderName, clientName: o.client_name, priority: o.priority,
        isChargeable: o.is_chargeable, department: o.department },
      artworks: detail.artworks.map(a => ({...a, feedbackStatus: statuses.find(s => s.id === a.id)?.feedback_status ?? "Pending"})),
      messages: detail.messages.filter(m => m.targetType === "artwork") };
  });
  res.setHeader("Cache-Control", "no-store");
  res.json({ data });
}));

// Shared links retain their bearer-link behavior; account mutations use only the
// cookie-authenticated /client-auth endpoints and their strict origin guard.
router.post("/client-portal/:token/message", clientHandler(async (req, res) => {
  const data = await transaction(async cx => {
    const link = await tokenLink(cx, req.params.token);
    await throttle(`public-message:${link.id}:${req.ip}`, 60);
    return sendConversation(cx, link, { ...req.body, targetType: "artwork", targetId: req.body?.artworkId }, "client");
  });
  res.status(201).json({ data });
}));

router.post("/client-portal/:token/feedback", clientHandler(async (req, res) => {
  const data = await transaction(async cx => {
    const link = await tokenLink(cx, req.params.token);
    await throttle(`public-feedback:${link.id}:${req.ip}`, 60);
    return decideArtwork(cx, link, req.body);
  });
  res.status(201).json({ data });
}));

router.get("/client-portal/:token/reference-orders", clientHandler(async (req, res) => {
  const type = String(req.query.type ?? "swatch");
  if (!["swatch","style"].includes(type)) throw new ClientAccessError(400, "Invalid type");
  const search = String(req.query.search ?? "").trim().slice(0,200);
  const data = await transaction(async cx => {
    const link = await tokenLink(cx, req.params.token);
    const { swatch, orderId } = orderInfo(link);
    const { rows: [order] } = await cx.query(`SELECT client_id FROM ${swatch ? "swatch_orders" : "style_orders"} WHERE id=$1`, [orderId]);
    if (!link.client_id || String(link.client_id) !== order.client_id) return [];
    const { rows } = await cx.query(`SELECT COALESCE(sw.id,st.id) AS id,l.token,l.portal_title AS "portalTitle",
      COALESCE(sw.order_code,st.order_code) AS "orderCode",COALESCE(sw.swatch_name,st.style_name) AS "orderName"
      ${visibleLinks} AND l.id<>$2 AND l.client_id=$4 AND ${type === "swatch" ? "sw.id" : "st.id"} IS NOT NULL
      AND (COALESCE(sw.order_code,st.order_code) ILIKE $3 OR COALESCE(sw.swatch_name,st.style_name) ILIKE $3)
      ORDER BY COALESCE(sw.created_at,st.created_at) DESC LIMIT 10`, [String(order.client_id),link.id,`%${search}%`,link.client_id]);
    return rows;
  });
  res.json({ data });
}));

export default router;
