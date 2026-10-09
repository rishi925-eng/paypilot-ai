import { Router, Response, NextFunction } from "express";
import { AuthenticatedRequest, optionalAuthMiddleware } from "../../middleware/auth.js";
import {
  getOrCreateCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "./cartService.js";

const router = Router();

// GET /api/cart
router.get("/", optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || "guest-session";
    const cart = await getOrCreateCart(req.user?.id, sessionId);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/items
router.post("/items", optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;
    const sessionId = (req.headers["x-session-id"] as string) || "guest-session";
    const cart = await getOrCreateCart(req.user?.id, sessionId);
    await addItemToCart(cart.id, productId, quantity || 1);
    const updatedCart = await getOrCreateCart(req.user?.id, sessionId);
    res.json({ success: true, data: updatedCart });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart/items/:id
router.put("/items/:id", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body;
    await updateCartItemQuantity(req.params.id, parseInt(quantity, 10));
    res.json({ success: true, message: "Cart item updated" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/items/:id
router.delete("/items/:id", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await removeCartItem(req.params.id);
    res.json({ success: true, message: "Cart item removed" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart
router.delete("/", optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || "guest-session";
    const cart = await getOrCreateCart(req.user?.id, sessionId);
    await clearCart(cart.id);
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
});

export const cartController = router;
