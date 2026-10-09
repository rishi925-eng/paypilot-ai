import { Router, Response, NextFunction } from "express";
import { AuthenticatedRequest, optionalAuthMiddleware, requireMerchantAuth } from "../../middleware/auth.js";
import { createOrder, getOrderById, listOrders, updateOrderStatus } from "./ordersService.js";

const router = Router();

// GET /api/orders
router.get("/", optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const isMerchant = req.user?.role === "MERCHANT" || req.user?.role === "ADMIN";
    const orders = await listOrders({
      userId: isMerchant ? undefined : req.user?.id,
      status: req.query.status as string,
    });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:idOrNumber
router.get("/:idOrNumber", async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const order = await getOrderById(req.params.idOrNumber);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders
router.post("/", optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { items, customerName, customerEmail, shippingAddress } = req.body;
    const order = await createOrder({
      userId: req.user?.id,
      customerName: customerName || req.user?.name || "Guest Buyer",
      customerEmail: customerEmail || req.user?.email || "guest@example.com",
      items,
      shippingAddress,
    });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status (Merchant or Admin)
router.patch("/:id/status", requireMerchantAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const order = await updateOrderStatus(req.params.id, status, `MERCHANT:${req.user?.id}`);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

export const ordersController = router;
