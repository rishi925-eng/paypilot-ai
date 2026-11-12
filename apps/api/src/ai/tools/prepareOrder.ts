import { prisma } from "../../config/prisma.js";
import { PrepareOrderInput, OrderQuote } from "@paypilot/contracts";
import { optimizeWithHoney } from "../../integrations/paypal/honeyCouponEngine.js";
import { assessSimilityRisk } from "../../integrations/paypal/similityRiskEngine.js";
import { calculateBnplInstallments } from "../../integrations/paypal/paidyBnplEngine.js";
import { getZettleInventorySync } from "../../integrations/paypal/zettleSyncEngine.js";

export interface ExtendedPrepareOrderInput extends PrepareOrderInput {
  couponCode?: string;
  applyHoneyDiscount?: boolean;
  runSimilityCheck?: boolean;
}

export async function toolPrepareOrder(input: ExtendedPrepareOrderInput): Promise<OrderQuote> {
  const itemsList = input.items || [];
  const productIds = itemsList.map((i: { productId: string; quantity: number }) => i.productId);
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { id: { in: productIds } },
        { slug: { in: productIds } },
      ],
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  const slugMap = new Map(products.map((p) => [p.slug, p]));

  let rawSubtotal = 0;
  const quoteItems = [];
  let primaryProductId = "";

  for (const item of itemsList) {
    const product = productMap.get(item.productId) || slugMap.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found in catalogue`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
    }

    if (!primaryProductId) primaryProductId = product.id;

    const lineTotal = Math.round(product.price * item.quantity * 100) / 100;
    rawSubtotal += lineTotal;

    quoteItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal,
    });
  }

  rawSubtotal = Math.round(rawSubtotal * 100) / 100;

  // Run PayPal Honey Coupon Engine if requested or by default
  let discountAmount = 0;
  let appliedCoupon: string | undefined = undefined;
  let honeyCashback = 0;

  if (input.applyHoneyDiscount !== false) {
    const honeyResult = await optimizeWithHoney(rawSubtotal);
    if (honeyResult.bestCoupon && honeyResult.discountAmount > 0) {
      discountAmount = honeyResult.discountAmount;
      appliedCoupon = honeyResult.bestCoupon.code;
      honeyCashback = honeyResult.honeyCashbackEarned;
    }
  }

  const effectiveSubtotal = Math.max(0, Math.round((rawSubtotal - discountAmount) * 100) / 100);
  const tax = Math.round(effectiveSubtotal * 0.08 * 100) / 100;
  const shipping = effectiveSubtotal >= 100 ? 0 : 9.99;
  const total = Math.round((effectiveSubtotal + tax + shipping) * 100) / 100;

  // Run PayPal Simility Risk Assessment
  let similityRiskScore = 6;
  let similityDecision = "APPROVED";
  if (input.runSimilityCheck !== false) {
    const risk = await assessSimilityRisk({
      orderAmount: total,
      itemCount: itemsList.reduce((acc: number, i: { quantity: number }) => acc + i.quantity, 0),
      customerEmail: "buyer-sandbox@paypilot.io",
      containsDiscount: discountAmount > 0,
    });
    similityRiskScore = risk.riskScore;
    similityDecision = risk.decision;
  }

  // Calculate PayPal Pay in 4 / Paidy BNPL Installment
  const bnpl = calculateBnplInstallments(total);
  const bnplInstallment = bnpl.installmentAmount;

  // Check Zettle Omnichannel availability
  let zettleStoresAvailable = 0;
  if (primaryProductId) {
    try {
      const zettleSync = await getZettleInventorySync(primaryProductId);
      zettleStoresAvailable = zettleSync.totalOmnichannelStock;
    } catch {
      // fallback
    }
  }

  const quoteId = "QUOTE-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

  return {
    quoteId,
    items: quoteItems,
    subtotal: rawSubtotal,
    discountAmount,
    couponCode: appliedCoupon,
    honeyCashback,
    similityRiskScore,
    similityDecision,
    bnplInstallment,
    zettleStoresAvailable,
    tax,
    shipping,
    total,
    currency: "USD",
    expiresAt,
    requiresUserApproval: true,
  };
}
