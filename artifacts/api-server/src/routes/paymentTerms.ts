import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { getPaymentTerms } from "../controllers/paymentTermsController";

const router: IRouter = Router();

router.get(
    "/payment-terms", 
    requireAuth,
    getPaymentTerms
);

export default router;