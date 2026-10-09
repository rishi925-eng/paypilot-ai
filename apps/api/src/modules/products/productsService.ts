import { prisma } from "../../config/prisma.js";

export async function getAllProducts(options?: {
  category?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
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

  return prisma.product.findMany({
    where,
    include: {
      attributes: true,
    },
    take: options?.limit || 50,
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductByIdOrSlug(idOrSlug: string) {
  return prisma.product.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      attributes: true,
    },
  });
}

export async function getProductsByIds(ids: string[]) {
  return prisma.product.findMany({
    where: {
      id: { in: ids },
    },
    include: {
      attributes: true,
    },
  });
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
