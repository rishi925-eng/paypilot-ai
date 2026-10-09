import { prisma } from "../../config/prisma.js";
import { PrepareOrderInput, OrderQuote } from "../../../../packages/contracts/src/index.js";

export async function toolPrepareOrder(input: PrepareOrderInput): Promise<OrderQuote> {
  const productIds = input.items.map((i) => i.productId);
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

  let subtotal = 0;
  const quoteItems = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId) || slugMap.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found in catalogue`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
    }

    const lineTotal = Math.round(product.price * item.quantity * 100) / 100;
    subtotal += lineTotal;

    quoteItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal,
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  const quoteId = "QUOTE-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

  return {
    quoteId,
    items: quoteItems,
    subtotal,
    tax,
    shipping,
    total,
    currency: "USD",
    expiresAt,
    requiresUserApproval: true,
  };
}
