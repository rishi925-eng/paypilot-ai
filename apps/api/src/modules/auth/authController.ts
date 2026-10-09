import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma.js";
import { AuthenticatedRequest, optionalAuthMiddleware } from "../../middleware/auth.js";
import crypto from "crypto";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Auto-create demo customer user if not exists
      const isMerchant = email.includes("merchant") || email.includes("admin");
      user = await prisma.user.create({
        data: {
          email,
          name: isMerchant ? "Merchant Manager" : "Alex Customer",
          passwordHash: "demo_hash",
          role: isMerchant ? "MERCHANT" : "CUSTOMER",
        },
      });
    }

    // Create session token
    const token = "paypilot_tok_" + crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.json({ success: false, user: null });
  }
  res.json({ success: true, user: req.user });
});

export const authController = router;
