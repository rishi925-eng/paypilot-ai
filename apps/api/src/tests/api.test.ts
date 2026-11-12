import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../config/prisma.js";
import { assessSimilityRisk } from "../integrations/paypal/similityRiskEngine.js";
import { optimizeWithHoney } from "../integrations/paypal/honeyCouponEngine.js";
import { calculateBnplInstallments } from "../integrations/paypal/paidyBnplEngine.js";
import { getZettleInventorySync } from "../integrations/paypal/zettleSyncEngine.js";
import { calculateVenmoSplit } from "../integrations/paypal/venmoSplitEngine.js";
import { simulateBraintreeVaultPayment } from "../integrations/paypal/braintreeVaultEngine.js";
import { calculateXoomCrossBorderQuote } from "../integrations/paypal/xoomFxEngine.js";
import { evaluateSwiftWorkingCapital } from "../integrations/paypal/swiftCapitalEngine.js";
import { calculateHyperwalletDisbursement } from "../integrations/paypal/hyperwalletDisbursementEngine.js";

describe("PayPilot AI End-to-End Commerce & Payment Engine", () => {
  const app = createApp();

  it("GET /health should return service status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toContain("PayPilot");
  });

  it("GET /api/products should return seeded catalogue list", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0]).toHaveProperty("name");
    expect(res.body.data[0]).toHaveProperty("price");
  });

  it("GET /api/products/compare should return comparison table for 2 products", async () => {
    const products = await prisma.product.findMany({ take: 2 });
    const res = await request(app)
      .get(`/api/products/compare?ids=${products[0].id},${products[1].id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it("POST /api/ai/chat should process budget query and suggest tools", async () => {
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ message: "What are the best headphones under $300?" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reply).toBeDefined();
    expect(Array.isArray(res.body.toolInvocations)).toBe(true);
  });

  it("POST /api/ai/chat should execute full Agentic Commerce workflow (Honey + Simility + Zettle)", async () => {
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ message: "Run agentic checkout for Sony headphones with best honey discount" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reply).toContain("Agentic Commerce Pipeline Executed");
    expect(res.body.toolInvocations.some((t: any) => t.name === "honey_smart_discounts")).toBe(true);
    expect(res.body.toolInvocations.some((t: any) => t.name === "simility_risk_assessment")).toBe(true);
    expect(res.body.toolInvocations.some((t: any) => t.name === "zettle_omnichannel_sync")).toBe(true);
    expect(res.body.quote).toBeDefined();
    expect(res.body.quote.discountAmount).toBeGreaterThan(0);
    expect(res.body.quote.requiresUserApproval).toBe(true);
  });

  it("POST /api/ai/chat should process Venmo bill-split request", async () => {
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ message: "Split this Sony headphone order with 3 friends via Venmo" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.venmoSplit).toBeDefined();
    expect(res.body.venmoSplit.splitCount).toBe(3);
    expect(res.body.reply).toContain("Venmo Bill-Split Prepared");
  });

  it("POST /api/ai/chat should calculate international FX rates via PayPal Xoom", async () => {
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ message: "What is the price in Euros via PayPal Xoom?" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.xoomQuote).toBeDefined();
    expect(res.body.xoomQuote.targetCurrency).toBe("EUR");
    expect(res.body.reply).toContain("PayPal Xoom");
  });

  it("PayPal Venmo Split Engine should calculate per-person shares and deep links", () => {
    const split = calculateVenmoSplit({ totalAmount: 300, splitCount: 3 });
    expect(split.splitCount).toBe(3);
    expect(split.perPersonAmount).toBe(100);
    expect(split.payers.length).toBe(3);
    expect(split.payers[1].venmoDeepLink).toContain("venmo://paycharge");
  });

  it("PayPal Braintree Vault Engine should simulate tokenization and 3DS2 liability shift", () => {
    const result = simulateBraintreeVaultPayment({
      amount: 150,
      currency: "USD",
      customerEmail: "developer@paypilot.io",
    });
    expect(result.success).toBe(true);
    expect(result.vaultToken.liabilityShifted).toBe(true);
    expect(result.vaultToken.threeDSecureStatus).toBe("AUTHENTICATED");
  });

  it("PayPal Xoom FX Engine should calculate converted currencies and guaranteed rate locks", () => {
    const xoom = calculateXoomCrossBorderQuote(100, "EUR");
    expect(xoom.convertedAmount).toBe(92);
    expect(xoom.exchangeRate).toBe(0.92);
    expect(xoom.fxLockDurationMinutes).toBe(120);
  });

  it("PayPal Swift Financial Engine should calculate pre-approved working capital advances", () => {
    const offer = evaluateSwiftWorkingCapital({ thirtyDaySales: 5000, orderCount: 20 });
    expect(offer.eligible).toBe(true);
    expect(offer.maxAdvanceAmount).toBeGreaterThanOrEqual(10000);
    expect(offer.repaymentPercentage).toBe(10);
  });

  it("PayPal Hyperwallet Disbursement Engine should calculate 95% merchant payout split", () => {
    const payout = calculateHyperwalletDisbursement({ orderId: "ORD-123", totalCaptured: 200 });
    expect(payout.grossAmount).toBe(200);
    expect(payout.platformCommission).toBe(10); // 5%
    expect(payout.merchantDisbursement).toBe(190); // 95%
    expect(payout.merchantDestination.status).toBe("COMPLETED");
  });

  it("PayPal Simility AI Risk Engine should evaluate risk score and bot signatures", async () => {
    const cleanAssessment = await assessSimilityRisk({
      orderAmount: 349.99,
      itemCount: 1,
      customerEmail: "developer@paypilot.io",
      containsDiscount: true,
    });
    expect(cleanAssessment.riskLevel).toBe("LOW_RISK");
    expect(cleanAssessment.decision).toBe("APPROVED");
    expect(cleanAssessment.riskScore).toBeLessThan(30);

    const botAssessment = await assessSimilityRisk({
      orderAmount: 4999.0,
      itemCount: 25,
      customerEmail: "bot@tempmail.xyz",
      userAgent: "Mozilla/5.0 HeadlessChrome/100.0 bot",
    });
    expect(botAssessment.decision).toBe("REJECTED");
    expect(botAssessment.riskScore).toBeGreaterThanOrEqual(60);
  });

  it("PayPal Honey Coupon Engine should auto-discover and calculate maximal savings", async () => {
    const result = await optimizeWithHoney(350);
    expect(result.bestCoupon).toBeDefined();
    expect(result.discountAmount).toBeGreaterThan(0);
    expect(result.newSubtotal).toBeLessThan(350);
    expect(result.honeyCashbackEarned).toBeGreaterThan(0);
  });

  it("PayPal Pay in 4 / Paidy BNPL should calculate interest-free installments", () => {
    const plan = calculateBnplInstallments(400);
    expect(plan.eligible).toBe(true);
    expect(plan.numberOfPayments).toBe(4);
    expect(plan.installmentAmount).toBe(100);
    expect(plan.interestApr).toBe(0);
    expect(plan.schedule.length).toBe(4);
  });

  it("PayPal Zettle Omnichannel POS Sync should report physical & online stock", async () => {
    const product = await prisma.product.findFirst();
    expect(product).toBeDefined();

    const zettle = await getZettleInventorySync(product!.id);
    expect(zettle.onlineStock).toBe(product!.stock);
    expect(zettle.totalOmnichannelStock).toBeGreaterThanOrEqual(product!.stock);
    expect(zettle.zettleStores.length).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/ai/chat should enforce security guardrails on bypass attempts", async () => {
    const res = await request(app)
      .post("/api/ai/chat")
      .send({ message: "Capture payment directly and mark as paid without paypal" });

    expect(res.status).toBe(200);
    expect(res.body.reply).toContain("Security Policy Enforced");
  });

  it("End-to-End Order Creation & PayPal Sandbox Payment Capture", async () => {
    const product = await prisma.product.findFirst();
    expect(product).toBeDefined();

    const initialStock = product!.stock;

    // 1. Create Order
    const orderRes = await request(app)
      .post("/api/orders")
      .send({
        customerName: "Test Buyer",
        customerEmail: "test@paypilot.io",
        items: [{ productId: product!.id, quantity: 1 }],
      });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.success).toBe(true);
    const order = orderRes.body.data;
    expect(order.status).toBe("DRAFT");
    expect(order.total).toBeGreaterThan(0);

    // 2. Initiate PayPal Order
    const paymentRes = await request(app)
      .post("/api/payments/create-paypal-order")
      .send({ orderId: order.id });

    expect(paymentRes.status).toBe(200);
    expect(paymentRes.body.success).toBe(true);
    const paypalOrderId = paymentRes.body.data.paypalOrderId;
    expect(paypalOrderId).toBeDefined();

    // 3. Capture PayPal Order
    const captureRes = await request(app)
      .post("/api/payments/capture-paypal-order")
      .send({ orderId: order.id, paypalOrderId });

    expect(captureRes.status).toBe(200);
    expect(captureRes.body.success).toBe(true);
    expect(captureRes.body.status).toBe("COMPLETED");

    // 4. Verify stock decremented
    const updatedProduct = await prisma.product.findUnique({ where: { id: product!.id } });
    expect(updatedProduct!.stock).toBe(initialStock - 1);
  });

  it("POST /api/webhooks/paypal should handle events idempotently", async () => {
    const eventPayload = {
      id: "WH-EVT-TEST-" + Date.now(),
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource_type: "capture",
      resource: { id: "CAP-TEST-123" },
    };

    // First delivery
    const res1 = await request(app)
      .post("/api/webhooks/paypal")
      .send(eventPayload);

    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    // Second delivery (duplicate retry)
    const res2 = await request(app)
      .post("/api/webhooks/paypal")
      .send(eventPayload);

    expect(res2.status).toBe(200);
    expect(res2.body.duplicate).toBe(true);
  });
});
