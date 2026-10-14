import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import * as controller from "../controllers/tradingProductsController";
import { mediaUploadMiddleware } from "../utils/uploadHelper";

const router: IRouter = Router();

router.post(
  "/trading-products",
  requireAuth,
  mediaUploadMiddleware.array("images", 10),
  controller.createTradingProduct,
);

router.get(
  "/trading-products",
  requireAuth,
  controller.getTradingProducts,
);

router.get(
  "/trading-products/export",
  requireAuth,
  controller.exportTradingProducts,
);

router.post(
  "/trading-products/import",
  requireAuth,
  controller.importTradingProducts,
);

router.get(
  "/trading-products/:id",
  requireAuth,
  controller.getTradingProductById,
);

router.put(
  "/trading-products/:id",
  requireAuth,
  mediaUploadMiddleware.array("images", 10),
  controller.updateTradingProduct,
);

router.patch(
  "/trading-products/:id",
  requireAuth,
  controller.updateTradingProductStatus,
);

router.delete(
  "/trading-products/:id",
  requireAuth,
  controller.deleteTradingProduct,
);

export default router;