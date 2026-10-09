import { prisma } from "../../config/prisma.js";
import { SearchProductsInput } from "../../../../packages/contracts/src/index.js";

export async function toolSearchProducts(input: SearchProductsInput) {
  const where: any = {};

  if (input.category && input.category !== "All") {
    where.category = { equals: input.category };
  }

  if (input.query) {
    const q = input.query.toLowerCase();
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { category: { contains: q } },
    ];
  }

  if (input.minPrice !== undefined || input.maxPrice !== undefined) {
    where.price = {};
    if (input.minPrice !== undefined) where.price.gte = input.minPrice;
    if (input.maxPrice !== undefined) where.price.lte = input.maxPrice;
  }

  const products = await prisma.product.findMany({
    where,
    include: { attributes: true },
    take: input.limit || 5,
    orderBy: { rating: "desc" },
  });

  return {
    count: products.length,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: p.price,
      currency: p.currency,
      stock: p.stock,
      rating: p.rating,
      keyAttributes: p.attributes.map((a) => `${a.name}: ${a.value}`).join(", "),
      imageUrl: p.imageUrl,
    })),
  };
}
