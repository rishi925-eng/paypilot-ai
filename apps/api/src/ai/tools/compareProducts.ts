import { prisma } from "../../config/prisma.js";
import { CompareProductsInput } from "../../../../packages/contracts/src/index.js";

export async function toolCompareProducts(input: CompareProductsInput) {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { id: { in: input.productIds } },
        { slug: { in: input.productIds } },
      ],
    },
    include: { attributes: true },
  });

  if (products.length === 0) {
    return { error: "No matching products found to compare." };
  }

  // Extract all unique attribute names
  const allAttributeNames = Array.from(
    new Set(products.flatMap((p) => p.attributes.map((a) => a.name)))
  );

  const comparisonTable = products.map((p) => {
    const attrMap = new Map(p.attributes.map((a) => [a.name, a.value]));
    const attrObj: Record<string, string> = {};
    for (const name of allAttributeNames) {
      attrObj[name] = attrMap.get(name) || "N/A";
    }

    return {
      id: p.id,
      name: p.name,
      price: `$${p.price.toFixed(2)}`,
      stock: p.stock > 0 ? `${p.stock} in stock` : "Out of stock",
      rating: `⭐ ${p.rating} (${p.reviewCount} reviews)`,
      ...attrObj,
    };
  });

  return {
    comparedCount: products.length,
    attributeNames: allAttributeNames,
    comparison: comparisonTable,
  };
}
