import { prisma } from "../../config/prisma.js";

export async function toolCheckInventory(productIds: string[]) {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { id: { in: productIds } },
        { slug: { in: productIds } },
      ],
    },
  });

  return products.map((p) => ({
    productId: p.id,
    name: p.name,
    stock: p.stock,
    isAvailable: p.stock > 0,
    statusText: p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? `Low Stock (${p.stock} left)` : "In Stock",
  }));
}
