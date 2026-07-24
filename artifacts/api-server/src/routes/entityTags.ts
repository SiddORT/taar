import { Router , Request} from "express";
import { db , asc, eq , ilike, and, entityTagsTable} from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router = Router();
type AuthRequest = Request & { user?: { userId: number; email: string; role: string } };


router.get("/entity-tags", requireAuth, async (req : AuthRequest, res): Promise<void> => {
  try {
    const entityType = String(req.query.entityType ?? "").trim();
    const search = String(req.query.search ?? "").trim();
    if (!entityType) {

      res.status(400).json({
        error: "entityType query parameter is required.",
      });
      return;
    }

    const conditions = [
      eq(entityTagsTable.entityType, entityType),
    ];

    if (search) {
      conditions.push(ilike(entityTagsTable.tag, `%${search}%`));
    }

    const rows = await db
      .selectDistinct({
        id: entityTagsTable.id,
        entity_id: entityTagsTable.entityId,
        entity_type: entityTagsTable.entityType,
        tag: entityTagsTable.tag,
      })
      .from(entityTagsTable)
      .where(and(...conditions))
      .orderBy(asc(entityTagsTable.tag));

    res.json({
      message: "Tags fetched successfully.",
      data: rows,
    });
  } catch (error) {
    logger.error({ error }, "Failed to fetch tags.");
    res.status(500).json({
      error: "Failed to fetch tags.",
    });
  }
});

export default router;