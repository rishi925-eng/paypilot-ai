import { prisma } from "../../config/prisma.js";
import { CheckBudgetInput } from "@paypilot/contracts";

export async function toolCheckBudget(input: CheckBudgetInput) {
  const itemsList = input.items || [];
  const productIds = itemsList.map((i: { productId: string; quantity?: number }) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  let calculatedSubtotal = 0;
  const itemBreakdown = [];

  for (const item of input.items) {
    const p = productMap.get(item.productId);
    if (!p) continue;
    const qty = item.quantity ?? 1;
    const lineTotal = p.price * qty;
    calculatedSubtotal += lineTotal;
    itemBreakdown.push({
      name: p.name,
      quantity: qty,
      unitPrice: p.price,
      lineTotal,
    });
  }

  const estimatedTax = Math.round(calculatedSubtotal * 0.08 * 100) / 100;
  const estimatedShipping = calculatedSubtotal >= 100 ? 0 : 9.99;
  const estimatedTotal = Math.round((calculatedSubtotal + estimatedTax + estimatedShipping) * 100) / 100;
  const difference = Math.round((input.budget - estimatedTotal) * 100) / 100;
  const isWithinBudget = difference >= 0;

  return {
    budget: input.budget,
    estimatedTotal,
    difference,
    isWithinBudget,
    breakdown: {
      subtotal: calculatedSubtotal,
      tax: estimatedTax,
      shipping: estimatedShipping,
      items: itemBreakdown,
    },
    recommendation: isWithinBudget
      ? `Great news! This fits comfortably within your budget of $${input.budget.toFixed(2)} with $${difference.toFixed(2)} remaining.`
      : `This exceeds your budget of $${input.budget.toFixed(2)} by $${Math.abs(difference).toFixed(2)}. Consider switching to an alternative model or adjusting quantity.`,
  };
}
