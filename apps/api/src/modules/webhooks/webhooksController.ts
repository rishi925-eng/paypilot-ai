import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma.js";
import { verifyPayPalWebhookSignature, WebhookHeaders } from "../../integrations/paypal/webhookVerification.js";
import { updateOrderStatus } from "../orders/ordersService.js";
import { logger } from "../../config/logger.js";

const router = Router();

// POST /api/webhooks/paypal
router.post("/paypal", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const headers: WebhookHeaders = {
      "paypal-auth-algo": req.headers["paypal-auth-algo"] as string,
      "paypal-cert-url": req.headers["paypal-cert-url"] as string,
      "paypal-transmission-id": req.headers["paypal-transmission-id"] as string,
      "paypal-transmission-sig": req.headers["paypal-transmission-sig"] as string,
      "paypal-transmission-time": req.headers["paypal-transmission-time"] as string,
    };

    const isValid = await verifyPayPalWebhookSignature(headers, req.body);
    if (!isValid) {
      logger.warn({ headers }, "Invalid PayPal webhook signature rejected");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = req.body;
    const eventId = event.id || `EVENT-${Date.now()}`;
    const eventType = event.event_type;

    logger.info({ eventId, eventType }, "Received PayPal Webhook");

    // Idempotency check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent && existingEvent.status === "PROCESSED") {
      logger.info({ eventId }, "Duplicate webhook event already processed, acknowledging OK");
      return res.status(200).json({ success: true, duplicate: true });
    }

    const recordedEvent = await prisma.webhookEvent.upsert({
      where: { eventId },
      create: {
        eventId,
        eventType: eventType || "UNKNOWN",
        resourceType: event.resource_type || "UNKNOWN",
        payload: JSON.stringify(event),
        status: "PENDING",
      },
      update: {},
    });

    // Handle specific PayPal webhook event types
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = event.resource;
      const captureId = resource.id;
      const customId = resource.custom_id || resource.supplementary_data?.related_ids?.order_id;

      if (customId) {
        const order = await prisma.order.findFirst({
          where: { OR: [{ id: customId }, { orderNumber: customId }] },
        });

        if (order && order.status !== "COMPLETED") {
          await updateOrderStatus(order.id, "COMPLETED", "PAYPAL_WEBHOOK", { captureId });
          await prisma.payment.updateMany({
            where: { orderId: order.id },
            data: { status: "COMPLETED", paypalCaptureId: captureId },
          });
        }
      }
    } else if (eventType === "PAYMENT.CAPTURE.DENIED" || eventType === "PAYMENT.CAPTURE.DECLINED") {
      const resource = event.resource;
      const customId = resource.custom_id;
      if (customId) {
        const order = await prisma.order.findFirst({
          where: { OR: [{ id: customId }, { orderNumber: customId }] },
        });
        if (order && order.status !== "COMPLETED") {
          await updateOrderStatus(order.id, "FAILED", "PAYPAL_WEBHOOK");
        }
      }
    }

    await prisma.webhookEvent.update({
      where: { id: recordedEvent.id },
      data: { status: "PROCESSED", processedAt: new Date() },
    });

    res.status(200).json({ success: true, eventId, eventType });
  } catch (err) {
    next(err);
  }
});

// GET /api/webhooks/logs (Merchant only)
router.get("/logs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.webhookEvent.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

export const webhooksController = router;
