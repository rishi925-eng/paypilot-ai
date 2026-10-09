import { prisma } from "../../config/prisma.js";
import { createPayPalOrder, capturePayPalOrder, CreateOrderPayload } from "../../integrations/paypal/orders.js";
import { updateOrderStatus } from "../orders/ordersService.js";
import { logger } from "../../config/logger.js";

export async function createPayPalPaymentOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.status === "COMPLETED") throw new Error("Order is already paid");

  const purchaseUnits: CreateOrderPayload["purchase_units"] = [
    {
      reference_id: order.id,
      description: `PayPilot Order #${order.orderNumber}`,
      amount: {
        currency_code: order.currency,
        value: order.total.toFixed(2),
        breakdown: {
          item_total: {
            currency_code: order.currency,
            value: order.subtotal.toFixed(2),
          },
          tax_total: {
            currency_code: order.currency,
            value: order.tax.toFixed(2),
          },
          shipping: {
            currency_code: order.currency,
            value: order.shipping.toFixed(2),
          },
        },
      },
      items: order.items.map((item) => ({
        name: item.productName.substring(0, 120),
        unit_amount: {
          currency_code: order.currency,
          value: item.unitPrice.toFixed(2),
        },
        quantity: item.quantity.toString(),
      })),
    },
  ];

  logger.info({ orderId, orderNumber: order.orderNumber, total: order.total }, "Initiating PayPal order creation");

  const paypalOrder = await createPayPalOrder({
    intent: "CAPTURE",
    purchase_units: purchaseUnits,
  });

  // Record payment attempt
  await prisma.paymentAttempt.create({
    data: {
      orderId: order.id,
      paypalOrderId: paypalOrder.id,
      status: "INITIATED",
    },
  });

  // Create or update payment record
  await prisma.payment.upsert({
    where: { paypalOrderId: paypalOrder.id },
    create: {
      orderId: order.id,
      paypalOrderId: paypalOrder.id,
      amount: order.total,
      currency: order.currency,
      status: "CREATED",
      rawResponse: JSON.stringify(paypalOrder),
    },
    update: {
      amount: order.total,
      status: "CREATED",
      rawResponse: JSON.stringify(paypalOrder),
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAYMENT_PENDING" },
  });

  return {
    paypalOrderId: paypalOrder.id,
    orderId: order.id,
    orderNumber: order.orderNumber,
    total: order.total,
    currency: order.currency,
  };
}

export async function capturePayment(orderId: string, paypalOrderId: string, ipAddress?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.status === "COMPLETED") {
    logger.warn({ orderId, paypalOrderId }, "Order is already completed (idempotency check)");
    return { success: true, alreadyCompleted: true, order };
  }

  try {
    const captureResult = await capturePayPalOrder(paypalOrderId);
    const capture = captureResult?.purchase_units?.[0]?.payments?.captures?.[0];
    const payer = captureResult?.payment_source?.paypal || captureResult?.payer;

    const isSuccess =
      captureResult.status === "COMPLETED" ||
      capture?.status === "COMPLETED";

    if (isSuccess) {
      const captureId = capture?.id || "CAPTURE-" + Date.now();

      // Update Payment
      await prisma.payment.upsert({
        where: { paypalOrderId },
        create: {
          orderId: order.id,
          paypalOrderId,
          paypalCaptureId: captureId,
          amount: order.total,
          currency: order.currency,
          status: "COMPLETED",
          payerEmail: payer?.email_address || order.customerEmail,
          payerId: payer?.account_id || payer?.payer_id || "PAYER_SANDBOX",
          rawResponse: JSON.stringify(captureResult),
        },
        update: {
          paypalCaptureId: captureId,
          status: "COMPLETED",
          payerEmail: payer?.email_address || order.customerEmail,
          payerId: payer?.account_id || payer?.payer_id || "PAYER_SANDBOX",
          rawResponse: JSON.stringify(captureResult),
        },
      });

      // Record successful attempt
      await prisma.paymentAttempt.create({
        data: {
          orderId: order.id,
          paypalOrderId,
          status: "SUCCESS",
          ipAddress,
        },
      });

      // Update order to COMPLETED (which automatically decrements inventory)
      const completedOrder = await updateOrderStatus(order.id, "COMPLETED", "PAYPAL_CAPTURE", {
        paypalOrderId,
        captureId,
      });

      logger.info({ orderId, captureId, amount: order.total }, "Payment captured and order completed successfully");

      return {
        success: true,
        order: completedOrder,
        captureId,
        status: "COMPLETED",
      };
    } else {
      await prisma.paymentAttempt.create({
        data: {
          orderId: order.id,
          paypalOrderId,
          status: "FAILED",
          errorMessage: `PayPal status: ${captureResult.status}`,
          ipAddress,
        },
      });

      await updateOrderStatus(order.id, "PAYMENT_REVIEW", "PAYPAL_CAPTURE_INCOMPLETE");

      return {
        success: false,
        status: captureResult.status,
        message: "Payment could not be completed immediately. Placed in payment review.",
      };
    }
  } catch (error: any) {
    logger.error({ error, orderId, paypalOrderId }, "Error during PayPal capture");

    await prisma.paymentAttempt.create({
      data: {
        orderId: order.id,
        paypalOrderId,
        status: "FAILED",
        errorMessage: error.message,
        ipAddress,
      },
    });

    throw error;
  }
}
