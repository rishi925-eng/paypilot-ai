import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma.js";
import { AuthenticatedRequest, optionalAuthMiddleware } from "../../middleware/auth.js";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const userRole = role === "MERCHANT" || cleanEmail.includes("merchant") ? "MERCHANT" : "CUSTOMER";
    const passwordHash = password ? hashPassword(password) : "demo_hash";

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: name.trim(),
        passwordHash,
        role: userRole,
      },
    });

    const token = "paypilot_tok_" + crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    res.status(201).json({
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

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      // Auto-provision demo account if not exists for frictionless testing
      const isMerchant = cleanEmail.includes("merchant") || cleanEmail.includes("admin");
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: isMerchant ? "Rishi (Merchant Admin)" : "Alex Customer",
          passwordHash: password ? hashPassword(password) : "demo_hash",
          role: isMerchant ? "MERCHANT" : "CUSTOMER",
        },
      });
    } else if (password && user.passwordHash !== "demo_hash" && !user.passwordHash.startsWith("demo_hash")) {
      const inputHash = hashPassword(password);
      if (user.passwordHash !== inputHash) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }
    }

    // Create session token
    const token = "paypilot_tok_" + crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

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

// POST /api/auth/logout
router.post("/logout", optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      await prisma.session.deleteMany({ where: { token } });
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.json({ success: false, user: null });
  }

  // Fetch fresh user details
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  res.json({ success: true, user });
});

// GET /api/auth/demo-users
router.get("/demo-users", async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        email: "buyer@paypilot.io",
        name: "Alex Customer",
        role: "CUSTOMER",
        description: "Verified consumer with PayPal & Venmo shopping history",
      },
      {
        email: "merchant@paypilot.io",
        name: "Rishi (Merchant Admin)",
        role: "MERCHANT",
        description: "Merchant store manager with AG Grid Operations Hub & Analytics access",
      },
    ],
  });
});

export const authController = router;
