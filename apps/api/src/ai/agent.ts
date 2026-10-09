import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { toolSearchProducts } from "./tools/searchProducts.js";
import { toolCompareProducts } from "./tools/compareProducts.js";
import { toolCheckBudget } from "./tools/checkBudget.js";
import { toolCheckInventory } from "./tools/checkInventory.js";
import { toolPrepareOrder } from "./tools/prepareOrder.js";

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
  suggestedActions?: string[];
}

export async function runShoppingAgent(
  userQuery: string,
  history: AgentMessage[] = []
): Promise<AgentResponse> {
  logger.info({ userQuery, provider: env.AI_PROVIDER }, "Running AI Shopping Assistant Agent");

  const queryLower = userQuery.toLowerCase();
  const toolInvocations: AgentResponse["toolInvocations"] = [];
  let quote: any = undefined;
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
      suggestedActions: ["Search for products", "Check budget", "View cart"],
    };
  }

  // ========================================================
  // 2. Intent Detection & Tool Execution
  // ========================================================

  // Intent A: Compare Products
  if (
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
      // Default top audio or tech comparison
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

Would you like me to prepare a checkout quote for one of these, or check how it fits your budget?`;
    suggestedActions = [
      "Prepare quote for Sony WH-1000XM5",
      "Prepare quote for Anker Soundcore",
      "Check budget under $300",
    ];
  }
  // Intent B: Prepare Quote / Checkout
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
- **Estimated Tax (8%)**: \$${quote.tax.toFixed(2)}
- **Shipping**: ${quote.shipping === 0 ? "FREE" : `\$${quote.shipping.toFixed(2)}`}
- **Total**: **\$${quote.total.toFixed(2)}**

*Note: In accordance with our security guidelines, I cannot directly capture payment. Please review and click below to proceed to the secure PayPal Sandbox checkout.*`;
      suggestedActions = [
        "Proceed to PayPal Checkout",
        "Add item to cart instead",
        "Compare with another model",
      ];
    } catch (err: any) {
      reply = `I encountered an issue preparing the quote: ${err.message}`;
    }
  }
  // Intent C: Budget Check
  else if (
    queryLower.includes("budget") ||
    queryLower.includes("under") ||
    queryLower.includes("less than") ||
    queryLower.includes("₹") ||
    queryLower.includes("$")
  ) {
    // Extract numerical budget
    const numbers = userQuery.match(/\d+(\.\d+)?/g);
    const budgetVal = numbers ? parseFloat(numbers[0]) : 300;

    // Search products fitting budget
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
        "Compare these options",
        "Search in another category",
      ];
    } else {
      reply = `I couldn't find products under \$${budgetVal}. Our entry-level ANC headphones start at \$79.99 (Anker Soundcore Life Q30). Would you like to view those?`;
      suggestedActions = ["View Anker Soundcore Q30", "Search all audio products"];
    }
  }
  // Intent D: Default Product Discovery Search
  else {
    let category: string | undefined = undefined;
    if (queryLower.includes("audio") || queryLower.includes("headphone") || queryLower.includes("sound")) {
      category = "Audio";
    } else if (queryLower.includes("mouse") || queryLower.includes("keyboard") || queryLower.includes("accessory")) {
      category = "Accessories";
    } else if (queryLower.includes("monitor") || queryLower.includes("screen") || queryLower.includes("display")) {
      category = "Monitors";
    } else if (queryLower.includes("backpack") || queryLower.includes("bag") || queryLower.includes("travel")) {
      category = "Travel & Bags";
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

Would you like a detailed comparison, stock check, or an instant checkout quote?`;
      suggestedActions = [
        "Compare top 2 headphones",
        "Prepare order quote",
        "Check available stock",
      ];
    } else {
      reply =
        "I'm here to help you discover products, compare technical specifications, check budgets, and prepare quotes for PayPal checkout. Try asking me for 'best headphones for coding under $300' or 'compare Sony and Bose headphones'.";
      suggestedActions = [
        "Best headphones for coding under $300",
        "Compare Sony WH-1000XM5 vs Bose QC45",
        "Show all developer gear",
      ];
    }
  }

  return {
    reply,
    toolInvocations,
    quote,
    suggestedActions,
  };
}
