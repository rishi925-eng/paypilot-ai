import { Router, Request, Response, NextFunction } from "express";
import { paymentRateLimiter } from "../../middleware/rateLimit.js";
import { createPayPalPaymentOrder, capturePayment } from "./paymentsService.js";
import { z } from "zod";

const router = Router();

const CreatePaymentSchema = z.object({
  orderId: z.string().min(1),
});

const CapturePaymentSchema = z.object({
  orderId: z.string().min(1),
  paypalOrderId: z.string().min(1),
});

// POST /api/payments/create-paypal-order
router.post("/create-paypal-order", paymentRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = CreatePaymentSchema.parse(req.body);
    const result = await createPayPalPaymentOrder(orderId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/capture-paypal-order
router.post("/capture-paypal-order", paymentRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, paypalOrderId } = CapturePaymentSchema.parse(req.body);
    const ipAddress = req.ip || (req.headers["x-forwarded-for"] as string);
    const result = await capturePayment(orderId, paypalOrderId, ipAddress);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export const paymentsController = router;
