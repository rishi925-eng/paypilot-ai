import { prisma } from "../../config/prisma.js";

export async function createOrder(data: {
  userId?: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress?: any;
}) {
  if (!data.items || data.items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  // Fetch verified products from DB
  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const orderItemsData = [];

  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
    }

    const lineTotal = Math.round(product.price * item.quantity * 100) / 100;
    subtotal += lineTotal;

    orderItemsData.push({
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

  const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: data.userId || null,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      status: "DRAFT",
      subtotal,
      tax,
      shipping,
      total,
      currency: "USD",
      shippingAddress: data.shippingAddress ? JSON.stringify(data.shippingAddress) : null,
      items: {
        create: orderItemsData,
      },
      auditEvents: {
        create: {
          entityType: "ORDER",
          entityId: orderNumber,
          action: "CREATE",
          performedBy: data.userId ? `USER:${data.userId}` : "GUEST",
        },
      },
    },
    include: {
      items: true,
      payments: true,
      auditEvents: true,
    },
  });

  return order;
}

export async function getOrderById(orderIdOrNumber: string) {
  return prisma.order.findFirst({
    where: {
      OR: [{ id: orderIdOrNumber }, { orderNumber: orderIdOrNumber }],
    },
    include: {
      items: true,
      payments: true,
      paymentAttempts: true,
      auditEvents: true,
    },
  });
}

export async function listOrders(options?: {
  userId?: string;
  status?: string;
  limit?: number;
}) {
  const where: any = {};
  if (options?.userId) where.userId = options.userId;
  if (options?.status && options.status !== "ALL") where.status = options.status;

  return prisma.order.findMany({
    where,
    include: {
      items: true,
      payments: true,
    },
    take: options?.limit || 50,
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  performedBy: string = "SYSTEM",
  metadata?: any
) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      auditEvents: {
        create: {
          entityType: "ORDER",
          entityId: orderId,
          action: `STATUS_CHANGE_TO_${status}`,
          performedBy,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      },
    },
    include: {
      items: true,
    },
  });

  // If status is completed, decrement inventory
  if (status === "COMPLETED") {
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      await prisma.inventoryEvent.create({
        data: {
          productId: item.productId,
          changeAmount: -item.quantity,
          reason: "ORDER_FULFILLED",
          referenceId: order.id,
        },
      });
    }
  }

  return order;
}
