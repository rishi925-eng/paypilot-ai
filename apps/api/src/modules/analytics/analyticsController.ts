import { Router, Response, NextFunction } from "express";
import { AuthenticatedRequest, requireMerchantAuth } from "../../middleware/auth.js";
import { prisma } from "../../config/prisma.js";

const router = Router();

// GET /api/analytics/dashboard
router.get("/dashboard", requireMerchantAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Total & Verified Revenue (COMPLETED payments only)
    const completedOrders = await prisma.order.findMany({
      where: { status: "COMPLETED" },
      include: { items: true },
    });

    const verifiedRevenue = completedOrders.reduce((acc, o) => acc + o.total, 0);
    const totalOrdersCount = await prisma.order.count();
    const completedOrdersCount = completedOrders.length;
    const pendingOrdersCount = await prisma.order.count({
      where: { status: { in: ["PENDING_APPROVAL", "PAYMENT_PENDING", "PAYMENT_REVIEW"] } },
    });

    const averageOrderValue = completedOrdersCount > 0 ? verifiedRevenue / completedOrdersCount : 0;
    const conversionRate = totalOrdersCount > 0 ? (completedOrdersCount / totalOrdersCount) * 100 : 0;

    // 2. Products count & stock alerts
    const totalProducts = await prisma.product.count();
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 5 } },
      select: { id: true, name: true, stock: true, price: true },
    });

    // 3. AI Assistant Usage Insights
    const totalConversations = await prisma.aIConversation.count();
    const totalMessages = await prisma.aIMessage.count();

    // 4. Category breakdown
    const products = await prisma.product.findMany({ select: { category: true, price: true, stock: true } });
    const categoryStats: Record<string, { count: number; totalValue: number }> = {};
    for (const p of products) {
      if (!categoryStats[p.category]) categoryStats[p.category] = { count: 0, totalValue: 0 };
      categoryStats[p.category].count += 1;
      categoryStats[p.category].totalValue += p.price * p.stock;
    }

    // 5. Recent audit logs
    const recentAudits = await prisma.auditEvent.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    // 6. Revenue Trend (Sample days data for chart)
    const salesTrends = [
      { date: "Day 1", revenue: Math.round(verifiedRevenue * 0.15) },
      { date: "Day 2", revenue: Math.round(verifiedRevenue * 0.25) },
      { date: "Day 3", revenue: Math.round(verifiedRevenue * 0.20) },
      { date: "Day 4", revenue: Math.round(verifiedRevenue * 0.40) },
    ];

    // 7. Top-selling products
    const topSellingProducts = await prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    // 8. Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        status: true,
        total: true,
        createdAt: true,
      },
    });

    // 9. PayPal integration status
    const paypalIntegrations = [
      { name: "PayPal Sandbox REST v2", status: "active", type: "payments" },
      { name: "Venmo Social Splits", status: "active", type: "social" },
      { name: "Braintree Vault", status: "active", type: "gateway" },
      { name: "Honey Coupons", status: "active", type: "discounts" },
      { name: "Simility AI Risk", status: "active", type: "security" },
      { name: "Zettle POS Sync", status: "active", type: "omnichannel" },
      { name: "Paidy BNPL", status: "active", type: "financing" },
      { name: "Xoom FX Engine", status: "active", type: "international" },
      { name: "Swift Financial Capital", status: "active", type: "lending" },
      { name: "Hyperwallet Payouts", status: "active", type: "disbursements" },
    ];

    res.json({
      success: true,
      data: {
        metrics: {
          verifiedRevenue: Math.round(verifiedRevenue * 100) / 100,
          totalOrdersCount,
          completedOrdersCount,
          pendingOrdersCount,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          conversionRate: Math.round(conversionRate * 10) / 10,
          totalProducts,
          totalConversations,
          totalMessages,
        },
        lowStockProducts,
        categoryStats,
        salesTrends,
        recentAudits,
        topSellingProducts,
        recentOrders,
        paypalIntegrations,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/audits
router.get("/audits", requireMerchantAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const audits = await prisma.auditEvent.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: audits });
  } catch (err) {
    next(err);
  }
});

export const analyticsController = router;
