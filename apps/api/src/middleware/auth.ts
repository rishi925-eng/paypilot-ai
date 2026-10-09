import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (session && session.expiresAt > new Date()) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      };
    }
  } catch (error) {
    // Fail silently for optional auth
  }
  next();
}

export async function requireMerchantAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey && adminKey === env.ADMIN_API_KEY) {
    req.user = {
      id: "admin-key-user",
      email: "admin@paypilot.io",
      name: "Admin System Key",
      role: "MERCHANT",
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required for merchant operations" });
  }

  const token = authHeader.split(" ")[1];
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date()) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token" });
  }

  if (session.user.role !== "MERCHANT" && session.user.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Access forbidden: Merchant or Admin role required" });
  }

  req.user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };

  next();
}
