import { Router } from "express";
import { transaction, requireClient, ClientAccessError } from "../lib/clientAccounts";
import { clientHandler } from "./clientAuth";
import { clientOriginGuard } from "../lib/clientAccountSecurity";

const router = Router();
router.use("/client-auth/orders", clientOriginGuard);

const visibleLinks = `FROM client_links l
  LEFT JOIN swatch_orders sw ON sw.id=l.swatch_order_id AND sw.is_deleted=false
  LEFT JOIN style_orders st ON st.id=l.style_order_id AND st.is_deleted=false
  WHERE l.is_deleted=false AND l.is_published=true
  AND ((sw.client_id=$1 AND l.style_order_id IS NULL) OR (st.client_id=$1 AND l.swatch_order_id IS NULL))`;

router.get("/client-auth/orders", clientHandler(async (req, res) => {
  const data = await transaction(async cx => {
    const { client } = await requireClient(cx, req);
    const { rows } = await cx.query(`SELECT l.id,l.portal_title AS "portalTitle",
      COALESCE(sw.order_code,st.order_code) AS "orderCode",COALESCE(sw.swatch_name,st.style_name) AS "orderName",
      CASE WHEN sw.id IS NOT NULL THEN 'swatch' ELSE 'style' END AS "orderType"
      ${visibleLinks} ORDER BY l.created_at DESC`, [String(client.id)]);
    return rows;
  });
  res.json({ data });
}));

router.get("/client-auth/orders/:id", clientHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) throw new ClientAccessError(404, "Published order not found");
  const data = await transaction(async cx => {
    const { client } = await requireClient(cx, req);
    const { rows: [link] } = await cx.query(`SELECT l.id,l.portal_title,l.hidden_images,l.closed_threads,
      l.swatch_order_id,l.style_order_id,COALESCE(sw.order_code,st.order_code) AS order_code,
      COALESCE(sw.swatch_name,st.style_name) AS order_name,COALESCE(sw.description,st.description) AS description,
      COALESCE(sw.delivery_date,st.delivery_date) AS delivery_date,COALESCE(sw.order_status,st.order_status) AS order_status
      ${visibleLinks} AND l.id=$2`, [String(client.id), id]);
    if (!link) throw new ClientAccessError(404, "Published order not found");
    const isSwatch = !!link.swatch_order_id;
    // Table/column names are fixed server constants, never request input.
    const { rows: artworks } = await cx.query(`SELECT id,artwork_code,artwork_name,wip_images,final_images FROM ${isSwatch ? "artworks" : "style_order_artworks"}
      WHERE ${isSwatch ? "swatch_order_id" : "style_order_id"}=$1 AND is_deleted=false ORDER BY id`, [isSwatch ? link.swatch_order_id : link.style_order_id]);
    const { rows: feedback } = await cx.query("SELECT artwork_id,decision FROM client_feedback WHERE client_link_id=$1 AND is_deleted=false ORDER BY created_at,id", [id]);
    const { rows: messages } = await cx.query(`SELECT id,artwork_id AS "artworkId",sender,message,attachment,created_at AS "createdAt"
      FROM client_messages WHERE client_link_id=$1 AND is_deleted=false ORDER BY created_at,id`, [id]);
    const hidden: { artworkId: number; imageType: string; imageIndex: number }[] = link.hidden_images ?? [];
    const closed: number[] = link.closed_threads ?? [];
    const artworkIds = new Set(artworks.map(a => a.id));
    return {
      link: { id, portalTitle: link.portal_title, orderType: isSwatch ? "swatch" : "style" },
      order: { orderCode: link.order_code, orderName: link.order_name, description: link.description, deliveryDate: link.delivery_date, orderStatus: link.order_status },
      artworks: artworks.map(a => ({
        id: a.id, artworkCode: a.artwork_code, artworkName: a.artwork_name,
        wipImages: (a.wip_images ?? []).filter((_: unknown, i: number) => !hidden.some(h => h.artworkId === a.id && h.imageType === "wip" && h.imageIndex === i)),
        finalImages: (a.final_images ?? []).filter((_: unknown, i: number) => !hidden.some(h => h.artworkId === a.id && h.imageType === "final" && h.imageIndex === i)),
        isClosed: closed.includes(a.id), decision: feedback.filter(f => f.artwork_id === a.id).at(-1)?.decision ?? null,
      })),
      messages: messages.filter(m => artworkIds.has(m.artworkId)),
    };
  });
  res.json({ data });
}));

export default router;
