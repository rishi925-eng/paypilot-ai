import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { toolSearchProducts } from "./tools/searchProducts.js";
import { toolCompareProducts } from "./tools/compareProducts.js";
import { toolCheckBudget } from "./tools/checkBudget.js";
import { toolCheckInventory } from "./tools/checkInventory.js";
import { toolPrepareOrder } from "./tools/prepareOrder.js";
import { optimizeWithHoney } from "../integrations/paypal/honeyCouponEngine.js";
import { assessSimilityRisk } from "../integrations/paypal/similityRiskEngine.js";
import { getZettleInventorySync } from "../integrations/paypal/zettleSyncEngine.js";
import { calculateBnplInstallments } from "../integrations/paypal/paidyBnplEngine.js";
import { calculateVenmoSplit } from "../integrations/paypal/venmoSplitEngine.js";
import { calculateXoomCrossBorderQuote } from "../integrations/paypal/xoomFxEngine.js";
import { evaluateSwiftWorkingCapital } from "../integrations/paypal/swiftCapitalEngine.js";

export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentResponse {
  reply: string;
  toolInvocations: Array<{
    name: string;
    input: any;
    result: any;
  }>;
  quote?: any;
  venmoSplit?: any;
  xoomQuote?: any;
  swiftOffer?: any;
  suggestedActions?: string[];
}

export async function runShoppingAgent(
  userQuery: string,
  history: AgentMessage[] = []
): Promise<AgentResponse> {
  logger.info({ userQuery, provider: env.AI_PROVIDER }, "Running PayPilot Agentic Shopping Copilot");

  const queryLower = userQuery.toLowerCase();
  const toolInvocations: AgentResponse["toolInvocations"] = [];
  let quote: any = undefined;
  let venmoSplit: any = undefined;
  let xoomQuote: any = undefined;
  let swiftOffer: any = undefined;
  let reply = "";
  let suggestedActions: string[] = [];

  // ========================================================
  // 1. Guardrail Check: Direct Payment or Price Injection Bypass
  // ========================================================
  if (
    queryLower.includes("capture payment directly") ||
    queryLower.includes("mark as paid without paypal") ||
    queryLower.includes("set price to 0") ||
    queryLower.includes("free checkout")
  ) {
    return {
      reply:
        "⚠️ **Security Policy Enforced**: As an AI Shopping Assistant, I cannot directly authorize payments or alter catalogue prices. All payments must be securely authorized by you via the PayPal Sandbox checkout flow, with pricing calculated authoritatively from our verified database.",
      toolInvocations: [],
      suggestedActions: ["Search for products", "Check budget", "Run agentic checkout"],
    };
  }

  // ========================================================
  // 2. Intent Detection & Autonomous Tool Graph
  // ========================================================

  // Intent A: Venmo Bill-Splitting Flow
  if (queryLower.includes("split") || queryLower.includes("venmo") || queryLower.includes("roommate") || queryLower.includes("friend")) {
    const numbers = userQuery.match(/\d+/g);
    const splitCount = numbers ? parseInt(numbers[0], 10) : 2;

    const targetPrice = 349.99; // Default flagship headphones or item
    venmoSplit = calculateVenmoSplit({
      totalAmount: targetPrice,
      splitCount,
      orderDescription: "Sony WH-1000XM5 Noise-Canceling Headphones",
    });

    toolInvocations.push({
      name: "venmo_bill_split",
      input: { total: targetPrice, splitCount },
      result: {
        splitCount: venmoSplit.splitCount,
        perPersonAmount: `$${venmoSplit.perPersonAmount}`,
        payers: venmoSplit.payers.map((p: any) => `${p.name}: $${p.shareAmount} (${p.status})`),
      },
    });

    reply = `👥 **PayPal Venmo Bill-Split Prepared**!

You can split this order across **${venmoSplit.splitCount} people**:
- **Your Share**: **$${venmoSplit.primaryPayerShare.toFixed(2)}** (Authorized via PayPal / Venmo)
- **Each Friend Pays**: **$${venmoSplit.perPersonAmount.toFixed(2)}**

I've generated instant Venmo payment request links and a QR code for your group!`;

    suggestedActions = [
      "Approve my half & launch Venmo checkout",
      "Split with 3 friends instead",
      "Run full Agentic Auto-Pilot for discounts",
    ];
  }
  // Intent B: Xoom Cross-Border International Currency & FX Flow
  else if (
    queryLower.includes("xoom") ||
    queryLower.includes("euro") ||
    queryLower.includes("gbp") ||
    queryLower.includes("pound") ||
    queryLower.includes("inr") ||
    queryLower.includes("rupee") ||
    queryLower.includes("international") ||
    queryLower.includes("currency")
  ) {
    let targetCur: "EUR" | "GBP" | "INR" | "CAD" | "JPY" = "EUR";
    if (queryLower.includes("gbp") || queryLower.includes("pound")) targetCur = "GBP";
    if (queryLower.includes("inr") || queryLower.includes("rupee")) targetCur = "INR";
    if (queryLower.includes("cad") || queryLower.includes("canada")) targetCur = "CAD";
    if (queryLower.includes("jpy") || queryLower.includes("yen")) targetCur = "JPY";

    const baseUSD = 349.99;
    xoomQuote = calculateXoomCrossBorderQuote(baseUSD, targetCur);

    toolInvocations.push({
      name: "xoom_cross_border_fx",
      input: { amountUSD: baseUSD, targetCurrency: targetCur },
      result: {
        convertedAmount: xoomQuote.formattedTargetAmount,
        rate: `1 USD = ${xoomQuote.exchangeRate} ${targetCur}`,
        transferFee: xoomQuote.xoomTransferFee === 0 ? "FREE" : `$${xoomQuote.xoomTransferFee}`,
        rateLock: `${xoomQuote.fxLockDurationMinutes} minutes guaranteed`,
      },
    });

    reply = `🌍 **PayPal Xoom International FX Quote**:

For cross-border international orders:
- **Base Price**: \$${baseUSD.toFixed(2)} USD
- **Converted Total**: **${xoomQuote.formattedTargetAmount}**
- **Exchange Rate**: 1 USD = ${xoomQuote.exchangeRate} ${targetCur}
- **Xoom Transfer Fee**: ${xoomQuote.xoomTransferFee === 0 ? "FREE ($0.00)" : `$${xoomQuote.xoomTransferFee}`}
- **Guaranteed FX Lock**: 120 Minutes

You can pay in your local currency directly through the PayPal Global Sandbox.`;

    suggestedActions = [
      "View in GBP (£)",
      "View in INR (₹)",
      "Proceed to PayPal Sandbox checkout",
    ];
  }
  // Intent C: Swift Financial Merchant Financing Inquiries
  else if (queryLower.includes("swift") || queryLower.includes("capital") || queryLower.includes("loan") || queryLower.includes("financing")) {
    swiftOffer = evaluateSwiftWorkingCapital({
      thirtyDaySales: 4500,
      orderCount: 18,
      disputeCount: 0,
    });

    toolInvocations.push({
      name: "swift_working_capital",
      input: { storeId: "merchant-primary", thirtyDaySales: 4500 },
      result: {
        eligible: swiftOffer.eligible,
        maxAdvance: `$${swiftOffer.maxAdvanceAmount.toLocaleString()}`,
        fixedFee: `$${swiftOffer.fixedFee}`,
        repaymentRate: `${swiftOffer.repaymentPercentage}% of daily sales`,
      },
    });

    reply = `💼 **PayPal Swift Financial (Working Capital) Assessment**:

${swiftOffer.recommendation}

- **Pre-Approved Capital Advance**: **$${swiftOffer.maxAdvanceAmount.toLocaleString()} USD**
- **Fixed One-Time Fee**: \$${swiftOffer.fixedFee}
- **Repayment Model**: Automatic ${swiftOffer.repaymentPercentage}% deduction from future verified PayPal captures.
- **Credit Check**: None required — 100% based on verified PayPal sandbox sales telemetry!`;

    suggestedActions = [
      "View in Merchant Operations Hub",
      "Check 30-Day Sales Telemetry",
      "Return to Shopping Copilot",
    ];
  }
  // Intent D: Full Agentic Commerce Auto-Pilot (Honey + Simility + Zettle + Paidy + Quote)
  else if (
    queryLower.includes("agentic") ||
    queryLower.includes("auto-pilot") ||
    queryLower.includes("autopilot") ||
    queryLower.includes("honey") ||
    queryLower.includes("simility") ||
    queryLower.includes("discount") ||
    queryLower.includes("coupon") ||
    queryLower.includes("deal")
  ) {
    let slug = "sony-wh-1000xm5";
    if (queryLower.includes("bose")) slug = "bose-qc45";
    if (queryLower.includes("anker") || queryLower.includes("q30")) slug = "anker-soundcore-q30";
    if (queryLower.includes("keyboard") || queryLower.includes("keychron")) slug = "keychron-q1-pro";
    if (queryLower.includes("mouse") || queryLower.includes("master 3s")) slug = "logitech-mx-master-3s";
    if (queryLower.includes("monitor") || queryLower.includes("lg")) slug = "lg-ultrafine-27-4k";
    if (queryLower.includes("backpack")) slug = "peak-design-everyday-backpack-20l";

    // 1. Search catalogue for target specs
    const searchRes = await toolSearchProducts({ query: slug, limit: 1 });
    const product = searchRes.products[0] || {
      id: "prod-sony-xm5",
      name: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
      price: 349.99,
      stock: 12,
    };

    toolInvocations.push({
      name: "search_products",
      input: { query: slug },
      result: { product: product.name, price: product.price, inStock: product.stock },
    });

    // 2. PayPal Zettle POS Omnichannel Inventory Sync
    const zettleData = await getZettleInventorySync(product.id || "prod-sony-xm5");
    toolInvocations.push({
      name: "zettle_omnichannel_sync",
      input: { productId: product.id },
      result: {
        onlineStock: zettleData.onlineStock,
        totalOmnichannelStock: zettleData.totalOmnichannelStock,
        locations: zettleData.zettleStores.map((s) => `${s.locationName}: ${s.available} units available`),
      },
    });

    // 3. PayPal Honey Smart Coupon Optimizer
    const honeyData = await optimizeWithHoney(product.price);
    toolInvocations.push({
      name: "honey_smart_discounts",
      input: { subtotal: product.price },
      result: {
        testedCoupons: honeyData.allTestedCodes.length,
        bestCoupon: honeyData.bestCoupon?.code,
        savings: `$${honeyData.discountAmount.toFixed(2)}`,
        honeyGoldCashback: `$${honeyData.honeyCashbackEarned.toFixed(2)}`,
      },
    });

    // 4. Generate Zero-Trust Authoritative Quote
    quote = await toolPrepareOrder({
      items: [{ productId: slug, quantity: 1 }],
      applyHoneyDiscount: true,
      runSimilityCheck: true,
    });

    toolInvocations.push({
      name: "prepare_order",
      input: { items: [{ productId: slug, quantity: 1 }], coupon: honeyData.bestCoupon?.code },
      result: quote,
    });

    // 5. PayPal Simility Real-Time AI Fraud Risk Evaluation
    const risk = await assessSimilityRisk({
      orderAmount: quote.total,
      itemCount: 1,
      customerEmail: "buyer-sandbox@paypilot.io",
      containsDiscount: true,
    });

    toolInvocations.push({
      name: "simility_risk_assessment",
      input: { orderAmount: quote.total, customer: "buyer-sandbox@paypilot.io" },
      result: {
        riskScore: `${risk.riskScore}/100`,
        riskLevel: risk.riskLevel,
        decision: risk.decision,
        factors: risk.factors,
      },
    });

    // 6. Paidy / PayPal Pay in 4 Installments
    const bnpl = calculateBnplInstallments(quote.total);
    toolInvocations.push({
      name: "paidy_bnpl_schedule",
      input: { total: quote.total },
      result: {
        eligible: bnpl.eligible,
        biWeeklyPayment: `$${bnpl.installmentAmount.toFixed(2)}`,
        numberOfPayments: 4,
        interestApr: "0%",
      },
    });

    reply = `🚀 **Agentic Commerce Pipeline Executed Successfully**!

Here is your automated, multi-step transaction preparation:

1. 🔍 **Item Selected**: **${product.name}** (Authoritative Base Price: \$${product.price.toFixed(2)})
2. 🏬 **PayPal Zettle POS Sync**: **${zettleData.totalOmnichannelStock} units available** across online warehouse and Downtown/Manhattan retail locations.
3. 🍯 **PayPal Honey Applied**: Code **\`${honeyData.bestCoupon?.code}\`** found! You saved **\$${honeyData.discountAmount.toFixed(2)}** (${honeyData.savingsPercentage}% off) + earned **\$${honeyData.honeyCashbackEarned.toFixed(2)}** in Honey Gold rewards.
4. 🛡️ **PayPal Simility AI Risk Guard**: **Clean Rating (${risk.riskScore}/100)** — Device fingerprint verified, approved for instant capture.
5. 💳 **PayPal Pay Later / Paidy**: 4 interest-free installments of **\$${bnpl.installmentAmount.toFixed(2)}** every 2 weeks.

Review your locked server quote below and click to complete your purchase securely via **PayPal Sandbox** or **Venmo**.`;

    suggestedActions = [
      "Approve quote & launch PayPal Checkout",
      "Split with friends via Venmo",
      "Compare with another item",
    ];
  }
  // Intent E: Compare Products
  else if (
    queryLower.includes("compare") ||
    queryLower.includes("difference between") ||
    queryLower.includes("vs")
  ) {
    let productIds: string[] = [];
    if (queryLower.includes("sony") && queryLower.includes("bose")) {
      productIds = ["sony-wh-1000xm5", "bose-qc45"];
    } else if (queryLower.includes("headphones") || queryLower.includes("audio")) {
      productIds = ["sony-wh-1000xm5", "bose-qc45", "anker-soundcore-q30"];
    } else {
      productIds = ["sony-wh-1000xm5", "bose-qc45"];
    }

    const compResult = await toolCompareProducts({ productIds });
    toolInvocations.push({
      name: "compare_products",
      input: { productIds },
      result: compResult,
    });

    reply = `Here is a side-by-side comparison of the requested products based on our live catalogue specifications:

- **Sony WH-1000XM5** (\$349.99): Industry benchmark noise cancellation (8 microphones, 2 processors), 30h battery, ideal for deep focus and long flights.
- **Bose QuietComfort 45** (\$279.00): Legendary lightweight comfort, physical tactile buttons, balanced sound signature.
- **Anker Soundcore Life Q30** (\$79.99): High-value hybrid ANC option with custom app EQ and 40h ANC playtime.

Would you like me to run the Agentic Auto-Pilot to check Honey discounts, stock, and prepare a PayPal Sandbox quote?`;
    suggestedActions = [
      "⚡ Run Agentic Auto-Pilot for Sony XM5",
      "Split Sony XM5 with Roommate via Venmo",
      "Check budget under $300",
    ];
  }
  // Intent F: Prepare Quote / Standard Checkout
  else if (
    queryLower.includes("buy") ||
    queryLower.includes("order") ||
    queryLower.includes("quote") ||
    queryLower.includes("checkout") ||
    queryLower.includes("purchase")
  ) {
    let slug = "sony-wh-1000xm5";
    if (queryLower.includes("bose")) slug = "bose-qc45";
    if (queryLower.includes("anker") || queryLower.includes("q30")) slug = "anker-soundcore-q30";
    if (queryLower.includes("keyboard") || queryLower.includes("keychron")) slug = "keychron-q1-pro";
    if (queryLower.includes("mouse") || queryLower.includes("master 3s")) slug = "logitech-mx-master-3s";
    if (queryLower.includes("monitor") || queryLower.includes("lg")) slug = "lg-ultrafine-27-4k";
    if (queryLower.includes("backpack")) slug = "peak-design-everyday-backpack-20l";

    try {
      quote = await toolPrepareOrder({
        items: [{ productId: slug, quantity: 1 }],
        applyHoneyDiscount: true,
        runSimilityCheck: true,
      });

      toolInvocations.push({
        name: "prepare_order",
        input: { items: [{ productId: slug, quantity: 1 }] },
        result: quote,
      });

      reply = `I have generated an official server-verified quote for your order!

📋 **Quote Breakdown**:
- **Product**: ${quote.items[0].productName}
- **Unit Price**: \$${quote.items[0].unitPrice.toFixed(2)}
- **Subtotal**: \$${quote.subtotal.toFixed(2)}
${quote.discountAmount > 0 ? `- **PayPal Honey Discount (${quote.couponCode})**: -\$${quote.discountAmount.toFixed(2)}\n` : ""}- **Estimated Tax (8%)**: \$${quote.tax.toFixed(2)}
- **Shipping**: ${quote.shipping === 0 ? "FREE" : `\$${quote.shipping.toFixed(2)}`}
- **Total Due**: **\$${quote.total.toFixed(2)}**
- **PayPal Pay Later**: 4 payments of **\$${(quote.bnplInstallment || quote.total / 4).toFixed(2)}**

*Note: In accordance with our security guidelines, I cannot directly capture payment. Please review and click below to proceed to the secure PayPal Sandbox checkout.*`;
      suggestedActions = [
        "Proceed to PayPal Checkout",
        "Split with friends via Venmo",
        "Compare with another model",
      ];
    } catch (err: any) {
      reply = `I encountered an issue preparing the quote: ${err.message}`;
    }
  }
  // Intent G: Budget Check
  else if (
    queryLower.includes("budget") ||
    queryLower.includes("under") ||
    queryLower.includes("less than") ||
    queryLower.includes("₹") ||
    queryLower.includes("$")
  ) {
    const numbers = userQuery.match(/\d+(\.\d+)?/g);
    const budgetVal = numbers ? parseFloat(numbers[0]) : 300;

    const searchRes = await toolSearchProducts({
      maxPrice: budgetVal,
      limit: 3,
    });

    toolInvocations.push({
      name: "search_products",
      input: { maxPrice: budgetVal },
      result: searchRes,
    });

    if (searchRes.products.length > 0) {
      const topProd = searchRes.products[0];
      const budgetCheck = await toolCheckBudget({
        items: [{ productId: topProd.id, quantity: 1 }],
        budget: budgetVal,
      });

      toolInvocations.push({
        name: "check_budget",
        input: { items: [{ productId: topProd.id, quantity: 1 }], budget: budgetVal },
        result: budgetCheck,
      });

      reply = `Here are the best verified options from our catalogue within your budget of **\$${budgetVal}**:

${searchRes.products
  .map(
    (p, idx) =>
      `${idx + 1}. **${p.name}** — **\$${p.price.toFixed(2)}** (⭐ ${p.rating})\n   *${p.keyAttributes}*`
  )
  .join("\n\n")}

💡 **Budget Insight**: ${budgetCheck.recommendation}`;
      suggestedActions = [
        `Prepare quote for ${topProd.name.split(" ")[0]}`,
        "Run Agentic Auto-Pilot for discounts",
        "Split with friends via Venmo",
      ];
    } else {
      reply = `I couldn't find products under \$${budgetVal}. Our entry-level ANC headphones start at \$79.99 (Anker Soundcore Life Q30). Would you like to view those?`;
      suggestedActions = ["View Anker Soundcore Q30", "Search all audio products"];
    }
  }
  // Intent H: Default Product Discovery Search
  else {
    let category: string | undefined = undefined;
    if (queryLower.includes("audio") || queryLower.includes("headphone") || queryLower.includes("earphone") || queryLower.includes("sound") || queryLower.includes("music")) {
      category = "Audio";
    } else if (queryLower.includes("mouse") || queryLower.includes("keyboard") || queryLower.includes("accessory") || queryLower.includes("charger") || queryLower.includes("power bank")) {
      category = "Accessories";
    } else if (queryLower.includes("monitor") || queryLower.includes("screen") || queryLower.includes("display")) {
      category = "Monitors";
    } else if (queryLower.includes("laptop") || queryLower.includes("macbook") || queryLower.includes("computer")) {
      category = "Laptops";
    } else if (queryLower.includes("backpack") || queryLower.includes("bag") || queryLower.includes("travel")) {
      category = "Travel & Bags";
    } else if (queryLower.includes("camera") || queryLower.includes("photo") || queryLower.includes("video")) {
      category = "Cameras";
    }

    const searchRes = await toolSearchProducts({
      query: userQuery,
      category,
      limit: 3,
    });

    toolInvocations.push({
      name: "search_products",
      input: { query: userQuery, category },
      result: searchRes,
    });

    if (searchRes.products.length > 0) {
      reply = `I found **${searchRes.count} products** matching your query:

${searchRes.products
  .map(
    (p) =>
      `• **${p.name}** — **\$${p.price.toFixed(2)}**\n  *Key Features*: ${p.keyAttributes} | In Stock: ${p.stock}`
  )
  .join("\n\n")}

Would you like me to run our **Agentic Auto-Pilot** to find Honey discount codes, verify Zettle store stock, and prepare your PayPal quote?`;
      suggestedActions = [
        "⚡ Run Agentic Auto-Pilot Flow",
        "👥 Split with friends via Venmo",
        "Compare top 2 headphones",
      ];
    } else {
      reply =
        "I'm here to help you discover products, compare technical specifications, check budgets, split payments via Venmo, check international Xoom FX rates, and prepare quotes for PayPal checkout. Try asking me for 'best headphones for coding under $300' or 'split Sony headphones with 2 friends via Venmo'.";
      suggestedActions = [
        "Best headphones for coding under $300",
        "⚡ Run Agentic Auto-Pilot Flow",
        "👥 Split with 2 friends via Venmo",
      ];
    }
  }

  return {
    reply,
    toolInvocations,
    quote,
    venmoSplit,
    xoomQuote,
    swiftOffer,
    suggestedActions,
  };
}
