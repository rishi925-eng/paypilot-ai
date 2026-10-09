import { prisma } from "../../config/prisma.js";

export async function getOrCreateCart(userId?: string, sessionId?: string) {
  let cart = await prisma.cart.findFirst({
    where: {
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(sessionId ? [{ sessionId }] : []),
      ],
    },
    include: {
      items: {
        include: {
          product: {
            include: { attributes: true },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: userId || null,
        sessionId: sessionId || null,
      },
      include: {
        items: {
          include: {
            product: {
              include: { attributes: true },
            },
          },
        },
      },
    });
  }

  // Calculate authoritative monetary totals
  let subtotal = 0;
  for (const item of cart.items) {
    // Always use live product price from catalogue
    subtotal += item.product.price * item.quantity;
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 9.99;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  return {
    ...cart,
    summary: {
      itemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal,
      tax,
      shipping,
      total,
      currency: "USD",
    },
  };
}

export async function addItemToCart(
  cartId: string,
  productId: string,
  quantity: number = 1
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");
  if (product.stock < quantity) {
    throw new Error(`Insufficient stock. Only ${product.stock} units available.`);
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId,
        productId,
      },
    },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (product.stock < newQty) {
      throw new Error(`Cannot add more. Max available stock is ${product.stock}.`);
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty, unitPrice: product.price },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
        unitPrice: product.price,
      },
    });
  }

  return getOrCreateCart(undefined, undefined);
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
) {
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return;
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { product: true },
  });
  if (!item) throw new Error("Cart item not found");

  if (item.product.stock < quantity) {
    throw new Error(`Only ${item.product.stock} units available.`);
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
}

export async function removeCartItem(cartItemId: string) {
  await prisma.cartItem.delete({ where: { id: cartItemId } });
}

export async function clearCart(cartId: string) {
  await prisma.cartItem.deleteMany({ where: { cartId } });
}
