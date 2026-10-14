import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import * as controller from "../controllers/tradingPurchaseProductsController";
import { mediaUploadMiddleware } from "../utils/uploadHelper";

const router: IRouter = Router();

router.post(
  "/trading-purchases",
  requireAuth,
  mediaUploadMiddleware.array("attachments", 20),
  controller.createTradingPurchase,
);

router.get(
  "/trading-purchases",
  requireAuth,
  controller.getTradingPurchases,
);

router.get(
  "/trading-purchases/:id",
  requireAuth,
  controller.getTradingPurchaseById,
);

router.put(
  "/trading-purchases/:id",
  requireAuth,
  mediaUploadMiddleware.array("attachments", 20),
  controller.updateTradingPurchase,
);

router.delete(
  "/trading-purchases/:id",
  requireAuth,
  controller.deleteTradingPurchase,
);

export default router;