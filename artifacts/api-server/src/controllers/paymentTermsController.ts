import type { Request, Response } from "express";
import * as service from "../services/paymentTermsService";

export async function getPaymentTerms( req: Request, res: Response, ) {
  try {
    const search = String(req.query.search ?? "");

    const data = await service.listPaymentTerms({ search });

    res.status(200).json({
      message: "Payment terms fetched successfully",
      data,
      total: data.length,
    });
  } catch (err) {
    console.error("getPaymentTerms error:", err);

    res.status(500).json({
      message: "Failed to fetch payment terms",
    });
  }
}