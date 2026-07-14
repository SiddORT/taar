import { Router } from "express";
import { db, styleOrdersTable, eq, and, ilike, or, desc, sql } from "@workspace/db";
// import { eq, and, ilike, or, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { insertStyleOrderSchema, updateStyleOrderSchema, clientsTable } from "@workspace/db";
import { generateOrderCode } from "../services/orderCodeService";

const router = Router();

// List
router.get("/style-orders", requireAuth, async (req, res) => {
  const { search = "", status = "all", priority = "all", chargeable = "all", page = "1", limit = "24" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [eq(styleOrdersTable.isDeleted, false)];

  const q = search.trim();
  if (q) {
    conditions.push(
      or(
        ilike(styleOrdersTable.styleName, `%${q}%`),
        ilike(styleOrdersTable.styleNo, `%${q}%`),
        ilike(styleOrdersTable.clientName, `%${q}%`),
        ilike(styleOrdersTable.orderCode, `%${q}%`),
      )!,
    );
  }
  if (status !== "all") conditions.push(eq(styleOrdersTable.orderStatus, status));
  if (priority !== "all") conditions.push(eq(styleOrdersTable.priority, priority));
  if (chargeable === "yes") conditions.push(eq(styleOrdersTable.isChargeable, true));
  if (chargeable === "no") conditions.push(eq(styleOrdersTable.isChargeable, false));
  const { inhouse = "all" } = req.query as Record<string, string>;
  if (inhouse === "yes") conditions.push(eq(styleOrdersTable.isInhouse, true));
  if (inhouse === "no") conditions.push(eq(styleOrdersTable.isInhouse, false));

  const where = and(...conditions);

  const [rows, countRows] = await Promise.all([
    db.select().from(styleOrdersTable).where(where).orderBy(desc(styleOrdersTable.createdAt)).limit(limitNum).offset(offset),
    db.select({ id: styleOrdersTable.id }).from(styleOrdersTable).where(where),
  ]);

  return res.json({ data: rows, total: countRows.length, page: pageNum, limit: limitNum });
});

// Get one
router.get("/style-orders/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const [row] = await db.select().from(styleOrdersTable).where(eq(styleOrdersTable.id, id));
  if (!row || row.isDeleted) return res.status(404).json({ error: "Not found" });
  return res.json({ data: row });
});

// Create
router.post("/style-orders", requireAuth, async (req, res) => {
  const parsed = insertStyleOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  if (!parsed.data.clientId) {
    return res.status(400).json({ error: "Client is required" });
  }
  const clientId = Number(parsed.data.clientId);
  const orderCode = await generateOrderCode(
    clientId,
    "style_orders",
    "order_code"
  );
  const user = (req as any).user;

  const [row] = await db.insert(styleOrdersTable).values({
    ...parsed.data,
    orderCode,
    createdBy: user?.username ?? "system",
  }).returning();

  return res.status(201).json({ data: row });
});

// Update
router.put("/style-orders/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const parsed = updateStyleOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const user = (req as any).user;
  const [row] = await db.update(styleOrdersTable).set({
    ...parsed.data,
    updatedBy: user?.username ?? "system",
    updatedAt: new Date(),
  }).where(eq(styleOrdersTable.id, id)).returning();

  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json({ data: row });
});

// Patch status (cancel / priority change)
router.patch("/style-orders/:id/status", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const { orderStatus, priority, cancelReason } = req.body as { orderStatus?: string; priority?: string; cancelReason?: string };
  const user = (req as typeof req & { user?: { email: string } }).user;
  const updates: Partial<typeof styleOrdersTable.$inferInsert> = {
    updatedBy: user?.email ?? "system",
    updatedAt: new Date(),
  };
  if (orderStatus) updates.orderStatus = orderStatus;
  if (priority) updates.priority = priority;
  if (cancelReason !== undefined) updates.cancelReason = cancelReason;
  const [row] = await db.update(styleOrdersTable).set(updates).where(eq(styleOrdersTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json({ data: row });
});

// Delete (soft) — only Draft orders with no linked records
router.delete("/style-orders/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [order] = await db.select({ orderStatus: styleOrdersTable.orderStatus })
    .from(styleOrdersTable).where(eq(styleOrdersTable.id, id));
  if (!order) return res.status(404).json({ error: "Not found" });

  if (order.orderStatus !== "Draft") {
    return res.status(409).json({ error: `Cannot delete an order in "${order.orderStatus}" status. Use "Cancel Order" to deactivate it instead.` });
  }

  const linked = await db.execute(sql`
    SELECT (
      SELECT COUNT(*) FROM style_order_artworks WHERE style_order_id = ${id}
    ) + (
      SELECT COUNT(*) FROM consumption_log WHERE style_order_id = ${id}
    ) AS total
  `);
  if (Number((linked.rows?.[0] as Record<string, unknown>)?.total ?? 0) > 0) {
    return res.status(409).json({ error: "This order has linked artworks or stock consumptions. Use 'Cancel Order' to deactivate it instead." });
  }

  const user = (req as any).user;
  await db.update(styleOrdersTable).set({ isDeleted: true, deletedBy: user?.email ?? "system", deletedAt: new Date() }).where(eq(styleOrdersTable.id, id));
  return res.json({ message: "Deleted" });
});

export default router;
