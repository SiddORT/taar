import { Router, type IRouter } from "express";
import {
  db, clientLinksTable, clientMessagesTable, clientFeedbackTable,
  artworksTable, swatchOrdersTable, styleOrdersTable, styleOrderArtworksTable, eq, and, asc,
  desc, or, ilike, ne
} from "@workspace/db";

const SWATCH_REWORK_REVERT_STATUSES = ["Pending Approval", "Completed"];

const router: IRouter = Router();

router.get("/client-portal/:token", async (req, res): Promise<void> => {
  const { token } = req.params;

  const [link] = await db
    .select()
    .from(clientLinksTable)
    .where(eq(clientLinksTable.token, token));

  if (!link) {
    res.status(404).json({ error: "Link not found" });
    return;
  }

  if (!link.isPublished) {
    res.status(403).json({ error: "This link is not yet published" });
    return;
  }

  const isSwatch = !!link.swatchOrderId;
  const isStyle = !!link.styleOrderId;

  if (!isSwatch && !isStyle) {
    res.status(404).json({ error: "No order linked" });
    return;
  }

  let order: any = null;
  let artworks: any[] = [];

  if (isSwatch) {
    const [swatchOrder] = await db
      .select()
      .from(swatchOrdersTable)
      .where(eq(swatchOrdersTable.id, link.swatchOrderId!));

    if (!swatchOrder) {
      res.status(404).json({ error: "Swatch order not found" });
      return;
    }

    order = swatchOrder;

    artworks = await db
      .select()
      .from(artworksTable)
      .where(
        and(
          eq(artworksTable.swatchOrderId, link.swatchOrderId!),
          eq(artworksTable.isDeleted, false)
        )
      );
  } else {
    const [styleOrder] = await db
      .select()
      .from(styleOrdersTable)
      .where(eq(styleOrdersTable.id, link.styleOrderId!));

    if (!styleOrder) {
      res.status(404).json({ error: "Style order not found" });
      return;
    }

    order = styleOrder;

    artworks = await db
      .select()
      .from(styleOrderArtworksTable)
      .where(
        and(
          eq(styleOrderArtworksTable.styleOrderId, link.styleOrderId!),
          eq(styleOrderArtworksTable.isDeleted, false)
        )
      );
  }

  const feedbackRows = await db
    .select()
    .from(clientFeedbackTable)
    .where(eq(clientFeedbackTable.clientLinkId, link.id))
    .orderBy(asc(clientFeedbackTable.createdAt));

  const hidden =
    (link.hiddenImages as Array<{
      artworkId: number;
      imageType: string;
      imageIndex: number;
    }>) || [];

  const closedThreads = (link.closedThreads as number[]) || [];

  const filteredArtworks = artworks.map((aw) => {
    const wipImages = ((aw.wipImages as any[]) || []).filter(
      (_img, idx) =>
        !hidden.some(
          (h) =>
            h.artworkId === aw.id &&
            h.imageType === "wip" &&
            h.imageIndex === idx
        )
    );

    const finalImages = ((aw.finalImages as any[]) || []).filter(
      (_img, idx) =>
        !hidden.some(
          (h) =>
            h.artworkId === aw.id &&
            h.imageType === "final" &&
            h.imageIndex === idx
        )
    );

    const awFeedback = feedbackRows.filter((f) => f.artworkId === aw.id);
    const latestFeedback = awFeedback[awFeedback.length - 1] ?? null;
    return {
      id: aw.id,
      artworkCode: aw.artworkCode,
      artworkName: aw.artworkName,
      feedbackStatus: aw.feedbackStatus,
      wipImages,
      finalImages,
      isClosed: closedThreads.includes(aw.id),
      decision: latestFeedback?.decision ?? null,
    };
  });

  const messages = await db
    .select()
    .from(clientMessagesTable)
    .where(eq(clientMessagesTable.clientLinkId, link.id))
    .orderBy(asc(clientMessagesTable.createdAt));

  res.json({
    data: {
      link: {
        id: link.id,
        token: link.token,
        portalTitle: link.portalTitle,
        orderType: isSwatch ? "swatch" : "style",
      },
      order,
      artworks: filteredArtworks,
      messages,
    },
  });
});


router.post("/client-portal/:token/message", async (req, res): Promise<void> => {
  const { token } = req.params;

  const [link] = await db.select().from(clientLinksTable).where(eq(clientLinksTable.token, token));
  if (!link) { res.status(404).json({ error: "Link not found" }); return; }
  if (!link.isPublished) { res.status(403).json({ error: "Link not published" }); return; }

  const { artworkId, artworkName, message, attachment } = req.body as {
    artworkId: number;
    artworkName: string;
    message?: string;
    attachment?: { name: string; type: string; data: string; size: number };
  };

  if (!artworkId || (!message && !attachment)) {
    res.status(400).json({ error: "artworkId and message or attachment required" });
    return;
  }

  const closedThreads = (link.closedThreads as number[]) || [];
  if (closedThreads.includes(artworkId)) {
    res.status(403).json({ error: "This thread has been closed" });
    return;
  }

  const [created] = await db
    .insert(clientMessagesTable)
    .values({ clientLinkId: link.id, artworkId, artworkName, sender: "client", message: message ?? null, attachment: attachment ?? null })
    .returning();

  res.status(201).json({ data: created });
});

router.post("/client-portal/:token/feedback", async (req, res): Promise<void> => {
  const { token } = req.params;

  const [link] = await db.select().from(clientLinksTable).where(eq(clientLinksTable.token, token));
  if (!link) { res.status(404).json({ error: "Link not found" }); return; }
  if (!link.isPublished) { res.status(403).json({ error: "Link not published" }); return; }

  const { artworkId, artworkName, decision, comment } = req.body as {
    artworkId: number;
    artworkName: string;
    decision: "Approve" | "Rework";
    comment?: string;
  };

  if (!artworkId || !decision) { res.status(400).json({ error: "artworkId and decision required" }); return; }
  if (!["Approve", "Rework"].includes(decision)) { res.status(400).json({ error: "Invalid decision" }); return; }

  const closedThreads = (link.closedThreads as number[]) || [];
  if (closedThreads.includes(artworkId) && decision === "Rework") {
    res.status(403).json({ error: "Thread is closed" });
    return;
  }

  const [created] = await db
    .insert(clientFeedbackTable)
    .values({ clientLinkId: link.id, artworkId, artworkName, decision, comment: comment ?? null })
    .returning();

  if (decision === "Approve") {
    const updatedClosed = [...new Set([...closedThreads, artworkId])];
    await db.update(clientLinksTable).set({ closedThreads: updatedClosed, updatedAt: new Date() }).where(eq(clientLinksTable.id, link.id));
    await db.update(artworksTable).set({ feedbackStatus: "Approved" }).where(eq(artworksTable.id, artworkId));

    // If all artworks for this swatch order are now approved → advance order to Completed
    if (link.swatchOrderId) {
      const allArtworks = await db.select({ id: artworksTable.id })
        .from(artworksTable)
        .where(and(eq(artworksTable.swatchOrderId, link.swatchOrderId), eq(artworksTable.isDeleted, false)));
      const allClosed = allArtworks.every(aw => updatedClosed.includes(aw.id));
      if (allArtworks.length > 0 && allClosed) {
        await db.update(swatchOrdersTable).set({ orderStatus: "Completed", updatedAt: new Date() })
          .where(eq(swatchOrdersTable.id, link.swatchOrderId));
      }
    }
  }

  if (decision === "Rework" && link.swatchOrderId) {
    // Revert order to In Artwork so team knows rework is needed
    const [order] = await db.select({ orderStatus: swatchOrdersTable.orderStatus })
      .from(swatchOrdersTable).where(eq(swatchOrdersTable.id, link.swatchOrderId));
    if (order && SWATCH_REWORK_REVERT_STATUSES.includes(order.orderStatus)) {
      await db.update(swatchOrdersTable).set({ orderStatus: "In Artwork", updatedAt: new Date() })
        .where(eq(swatchOrdersTable.id, link.swatchOrderId));
    }
  }

  res.status(201).json({ data: created });
});

router.get("/client-portal/:token/reference-orders", async (req, res): Promise<void> => {
  try {
    const { token } = req.params;
    const search = String(req.query.search ?? "").trim();
    const type = String(req.query.type ?? "swatch").toLowerCase();

    if (!["swatch", "style"].includes(type)) {
      res.status(400).json({ error: "Invalid type" });
      return;
    }

    const [link] = await db
      .select()
      .from(clientLinksTable)
      .where(eq(clientLinksTable.token, token));

    if (!link) {
      res.status(404).json({ error: "Link not found" });
      return;
    }

    if (!link.isPublished) {
      res.status(403).json({ error: "This link is not yet published" });
      return;
    }

    if (!link.clientId) {
      res.json({ data: [] });
      return;
    }

    if (type === "swatch") {
      const conditions = [
        eq(clientLinksTable.clientId, link.clientId),
        eq(clientLinksTable.isPublished, true),
        eq(clientLinksTable.isDeleted, false),
        ne(clientLinksTable.id, link.id),
      ];

      if (search) {
        conditions.push(
          or(
            ilike(swatchOrdersTable.orderCode, `%${search}%`),
            ilike(swatchOrdersTable.swatchName, `%${search}%`)
          )!
        );
      }

      const orders = await db
        .select({
          id: swatchOrdersTable.id,
          orderCode: swatchOrdersTable.orderCode,
          orderName: swatchOrdersTable.swatchName,
          token: clientLinksTable.token,
          portalTitle: clientLinksTable.portalTitle,
        })
        .from(clientLinksTable)
        .innerJoin(
          swatchOrdersTable,
          eq(clientLinksTable.swatchOrderId, swatchOrdersTable.id)
        )
        .where(and(...conditions))
        .orderBy(desc(swatchOrdersTable.createdAt))
        .limit(10);

      res.json({ data: orders });
      return;
    }

    // Style Orders
    const conditions = [
      eq(clientLinksTable.clientId, link.clientId),
      eq(clientLinksTable.isPublished, true),
      eq(clientLinksTable.isDeleted, false),
      ne(clientLinksTable.id, link.id),
    ];

    if (search) {
      conditions.push(
        or(
          ilike(styleOrdersTable.orderCode, `%${search}%`),
          ilike(styleOrdersTable.styleName, `%${search}%`)
        )!
      );
    }

    const orders = await db
      .select({
        id: styleOrdersTable.id,
        orderCode: styleOrdersTable.orderCode,
        orderName: styleOrdersTable.styleName,
        token: clientLinksTable.token,
        portalTitle: clientLinksTable.portalTitle,
      })
      .from(clientLinksTable)
      .innerJoin(
        styleOrdersTable,
        eq(clientLinksTable.styleOrderId, styleOrdersTable.id)
      )
      .where(and(...conditions))
      .orderBy(desc(styleOrdersTable.createdAt))
      .limit(10);

    res.json({ data: orders });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: err.message ?? "Internal Server Error",
    });
  }
});

export default router;
