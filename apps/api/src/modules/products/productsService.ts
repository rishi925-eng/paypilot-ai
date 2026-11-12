import { prisma } from "../../config/prisma.js";

export async function getAllProducts(options?: {
  category?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  sort?: string;
}) {
  const where: any = {};

  if (options?.category && options.category !== "All") {
    where.category = { equals: options.category };
  }

  if (options?.query) {
    where.OR = [
      { name: { contains: options.query } },
      { description: { contains: options.query } },
      { category: { contains: options.query } },
    ];
  }

  if (options?.minPrice !== undefined || options?.maxPrice !== undefined) {
    where.price = {};
    if (options.minPrice !== undefined) where.price.gte = options.minPrice;
    if (options.maxPrice !== undefined) where.price.lte = options.maxPrice;
  }

  // Sorting support
  let orderBy: any = { createdAt: "desc" };
  if (options?.sort) {
    switch (options.sort) {
      case "price_asc":  orderBy = { price: "asc" }; break;
      case "price_desc": orderBy = { price: "desc" }; break;
      case "rating":     orderBy = { rating: "desc" }; break;
      case "name":       orderBy = { name: "asc" }; break;
      case "stock":      orderBy = { stock: "desc" }; break;
      default:           orderBy = { createdAt: "desc" };
    }
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      attributes: true,
    },
    take: options?.limit || 50,
    orderBy,
  });

  return products.map((p) => ({
    ...p,
    inStock: p.stock > 0,
  }));
}

export async function getProductByIdOrSlug(idOrSlug: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      attributes: true,
    },
  });

  if (!product) return null;

  return {
    ...product,
    inStock: product.stock > 0,
  };
}

export async function getProductsByIds(ids: string[]) {
  const products = await prisma.product.findMany({
    where: {
      id: { in: ids },
    },
    include: {
      attributes: true,
    },
  });

  return products.map((p) => ({
    ...p,
    inStock: p.stock > 0,
  }));
}

export async function createOrUpdateProduct(data: {
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  currency?: string;
  stock: number;
  imageUrl: string;
  attributes?: Array<{ name: string; value: string }>;
}) {
  if (data.id) {
    const existing = await prisma.product.findUnique({ where: { id: data.id } });
    if (!existing) throw new Error("Product not found");

    if (data.attributes) {
      await prisma.productAttribute.deleteMany({ where: { productId: data.id } });
    }

    const updated = await prisma.product.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category,
        price: data.price,
        currency: data.currency || "USD",
        stock: data.stock,
        imageUrl: data.imageUrl,
        attributes: data.attributes
          ? {
              create: data.attributes.map((a) => ({ name: a.name, value: a.value })),
            }
          : undefined,
      },
      include: { attributes: true },
    });

    return updated;
  } else {
    return prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category,
        price: data.price,
        currency: data.currency || "USD",
        stock: data.stock,
        imageUrl: data.imageUrl,
        attributes: data.attributes
          ? {
              create: data.attributes.map((a) => ({ name: a.name, value: a.value })),
            }
          : undefined,
      },
      include: { attributes: true },
    });
  }
}
