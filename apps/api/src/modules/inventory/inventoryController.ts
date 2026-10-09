import { Router, Response, NextFunction } from "express";
import { AuthenticatedRequest, requireMerchantAuth } from "../../middleware/auth.js";
import { prisma } from "../../config/prisma.js";

const router = Router();

// GET /api/inventory/events
router.get("/events", requireMerchantAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const events = await prisma.inventoryEvent.findMany({
      include: { product: true },
      take: 100,
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory/adjust (Merchant Only)
router.post("/adjust", requireMerchantAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, changeAmount, reason } = req.body;
    if (!productId || changeAmount === undefined) {
      return res.status(400).json({ success: false, message: "Missing productId or changeAmount" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const newStock = Math.max(0, product.stock + parseInt(changeAmount, 10));

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    await prisma.inventoryEvent.create({
      data: {
        productId,
        changeAmount: parseInt(changeAmount, 10),
        reason: reason || "MANUAL_ADJUSTMENT",
        referenceId: `MERCHANT:${req.user?.id}`,
      },
    });

    res.json({ success: true, data: updatedProduct });
  } catch (err) {
    next(err);
  }
});

export const inventoryController = router;
