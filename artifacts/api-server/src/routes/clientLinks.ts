import { Router, type IRouter } from "express";
// import { eq, and, asc, desc } from "drizzle-orm";
import { randomBytes } from "crypto";
import { eq, and, asc, desc ,db, clientLinksTable, clientFeedbackTable, clientMessagesTable, artworksTable, swatchOrdersTable, styleOrdersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { transaction } from "../lib/clientAccounts";
import { clientHandler } from "./clientAuth";
import { activeLink, orderInfo } from "../lib/clientWorkspace";
import { sendConversation, conversationTarget, conversationHistory } from "../lib/clientConversations";

const SWATCH_PRE_APPROVAL_STATUSES = ["Draft", "Issued", "In Sampling", "In Artwork"];
const STYLE_PRE_APPROVAL_STATUSES  = ["Draft", "Issued", "In Production", "In Review"];

const router: IRouter = Router();

router.get("/client-links/swatch/:swatchOrderId", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.swatchOrderId));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  let [link] = await db.select().from(clientLinksTable).where(and(eq(clientLinksTable.swatchOrderId, id), eq(clientLinksTable.isDeleted, false)));
  if (!link) {
    // Get client_id from swatch order
    const [swatchOrder] = await db
      .select({ clientId: swatchOrdersTable.clientId })
      .from(swatchOrdersTable)
      .where(eq(swatchOrdersTable.id, id));

    if (!swatchOrder) {
      res.status(404).json({ error: "Swatch order not found" });
      return;
    }
    const clientId = swatchOrder.clientId ? Number(swatchOrder.clientId) : null;
    const token = randomBytes(16).toString("hex");
    const [created] = await db.insert(clientLinksTable).values({ swatchOrderId: id, token, clientId }).returning();
    link = created;
  }
  res.json({ data: link });
});

router.get("/client-links/style/:styleOrderId", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.styleOrderId));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  let [link] = await db.select().from(clientLinksTable).where(and(eq(clientLinksTable.styleOrderId, id), eq(clientLinksTable.isDeleted, false)));
  if (!link) {
    const [styleOrder] = await db
      .select({ clientId: styleOrdersTable.clientId })
      .from(styleOrdersTable)
      .where(eq(styleOrdersTable.id, id));
    const clientId = styleOrder.clientId ? Number(styleOrder.clientId) : null;
    const token = randomBytes(16).toString("hex");
    const [created] = await db.insert(clientLinksTable).values({ styleOrderId: id, token, clientId }).returning();
    link = created;
  }
  res.json({ data: link });
});

router.patch("/client-links/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { isPublished, hiddenImages, portalTitle, closedThreads } = req.body as {
    isPublished?: boolean;
    hiddenImages?: Array<{ artworkId: number; imageType: "wip" | "final"; imageIndex: number }>;
    portalTitle?: string;
    closedThreads?: number[];
  };

  const [updated] = await db
    .update(clientLinksTable)
    .set({
      ...(isPublished !== undefined && { isPublished }),
      ...(hiddenImages !== undefined && { hiddenImages }),
      ...(portalTitle !== undefined && { portalTitle }),
      ...(closedThreads !== undefined && { closedThreads }),
      updatedAt: new Date(),
    })
    .where(and(eq(clientLinksTable.id, id), eq(clientLinksTable.isDeleted, false)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }

  // Auto-advance order status when client link is published
  if (isPublished && updated.swatchOrderId) {
    try {
      const [order] = await db.select({ id: swatchOrdersTable.id, orderStatus: swatchOrdersTable.orderStatus })
        .from(swatchOrdersTable).where(and(eq(swatchOrdersTable.id, updated.swatchOrderId), eq(swatchOrdersTable.isDeleted, false)));
      if (order && SWATCH_PRE_APPROVAL_STATUSES.includes(order.orderStatus)) {
        await db.update(swatchOrdersTable).set({ orderStatus: "Pending Approval", updatedAt: new Date() })
          .where(eq(swatchOrdersTable.id, updated.swatchOrderId));
      }
    } catch (_e) { /* non-critical */ }
  }
  if (isPublished && updated.styleOrderId) {
    try {
      const [order] = await db.select({ id: styleOrdersTable.id, orderStatus: styleOrdersTable.orderStatus })
        .from(styleOrdersTable).where(and(eq(styleOrdersTable.id, updated.styleOrderId), eq(styleOrdersTable.isDeleted, false)));
      if (order && STYLE_PRE_APPROVAL_STATUSES.includes(order.orderStatus)) {
        await db.update(styleOrdersTable).set({ orderStatus: "Pending Approval", updatedAt: new Date() })
          .where(eq(styleOrdersTable.id, updated.styleOrderId));
      }
    } catch (_e) { /* non-critical */ }
  }

  res.json({ data: updated });
});

router.post("/client-links/:id/regenerate", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const token = randomBytes(16).toString("hex");
  const [updated] = await db
    .update(clientLinksTable)
    .set({ token, isPublished: false, updatedAt: new Date() })
    .where(and(eq(clientLinksTable.id, id), eq(clientLinksTable.isDeleted, false)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ data: updated });
});

router.get("/client-links/:id/feedback", requireAuth, clientHandler(async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const rows = await db
    .select()
    .from(clientFeedbackTable)
    .where(and(eq(clientFeedbackTable.clientLinkId, id), eq(clientFeedbackTable.isDeleted, false)))
    .orderBy(asc(clientFeedbackTable.createdAt), asc(clientFeedbackTable.id));
  res.json({ data: rows });
}));

router.patch("/client-links/feedback/:feedbackId", requireAuth, clientHandler(async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.feedbackId));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { isResolved, internalNote } = req.body as { isResolved?: boolean; internalNote?: string };

  const [updated] = await db
    .update(clientFeedbackTable)
    .set({
      ...(isResolved !== undefined && { isResolved, resolvedAt: isResolved ? new Date() : null }),
      ...(internalNote !== undefined && { internalNote }),
    })
    .where(and(eq(clientFeedbackTable.id, id), eq(clientFeedbackTable.isDeleted, false)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }

  if (updated.isResolved && updated.decision === "Approve") {
    await transaction(async cx => {
      const link = await activeLink(cx, updated.clientLinkId);
      await conversationTarget(cx, link, "artwork", updated.artworkId, true);
      const { swatch, orderId } = orderInfo(link);
      await cx.query(`UPDATE ${swatch ? "artworks" : "style_order_artworks"} SET feedback_status='Approved'
        WHERE id=$1 AND ${swatch ? "swatch_order_id" : "style_order_id"}=$2 AND is_deleted=false`, [updated.artworkId,orderId]);
    });
  }

  res.json({ data: updated });
}));

/* ── Chat messages ── */

router.get("/client-links/:id/messages", requireAuth, clientHandler(async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const rows = await transaction(async cx => conversationHistory(cx, await activeLink(cx, id)));

  res.json({ data: rows });
}));

router.post("/client-links/:id/messages", requireAuth, clientHandler(async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const created = await transaction(async cx => sendConversation(cx, await activeLink(cx, id), req.body, "team", true));

  res.status(201).json({ data: created });
}));

router.patch("/client-links/:id/threads/toggle", requireAuth, clientHandler(async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { artworkId, closed } = req.body as { artworkId: number; closed: boolean };

  if (typeof closed !== "boolean") { res.status(400).json({ error: "closed must be a boolean" }); return; }
  const result = await transaction(async cx => {
  const link = await activeLink(cx, id);
  await conversationTarget(cx, link, "artwork", artworkId, true);
  const current = (link.closed_threads as number[]) ?? [];
  const updated = closed
    ? [...new Set([...current, artworkId])]
    : current.filter((a: number) => a !== artworkId);

  const { rows: [result] } = await cx.query(`UPDATE client_links SET closed_threads=$2,updated_at=now()
    WHERE id=$1 AND is_deleted=false RETURNING id,swatch_order_id AS "swatchOrderId",style_order_id AS "styleOrderId",
    client_id AS "clientId",token,is_published AS "isPublished",hidden_images AS "hiddenImages",
    portal_title AS "portalTitle",closed_threads AS "closedThreads",created_at AS "createdAt",
    updated_at AS "updatedAt",is_deleted AS "isDeleted",deleted_at AS "deletedAt",deleted_by AS "deletedBy"`, [id, JSON.stringify(updated)]);
  return result;
  });
  res.json({ data: result });
}));

export default router;
