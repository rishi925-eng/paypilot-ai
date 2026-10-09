import express from "express";
import cors from "cors";
import { standardRateLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authController } from "./modules/auth/authController.js";
import { productsController } from "./modules/products/productsController.js";
import { cartController } from "./modules/cart/cartController.js";
import { ordersController } from "./modules/orders/ordersController.js";
import { paymentsController } from "./modules/payments/paymentsController.js";
import { webhooksController } from "./modules/webhooks/webhooksController.js";
import { inventoryController } from "./modules/inventory/inventoryController.js";
import { analyticsController } from "./modules/analytics/analyticsController.js";
import { aiController } from "./ai/aiController.js";

export function createApp() {
  const app = express();

  // Standard Middlewares
  app.use(cors({ origin: "*", credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(standardRateLimiter);

  // Health check
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      service: "PayPilot AI Commerce & Payment Engine",
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Modules
  app.use("/api/auth", authController);
  app.use("/api/products", productsController);
  app.use("/api/cart", cartController);
  app.use("/api/orders", ordersController);
  app.use("/api/payments", paymentsController);
  app.use("/api/webhooks", webhooksController);
  app.use("/api/inventory", inventoryController);
  app.use("/api/analytics", analyticsController);
  app.use("/api/ai", aiController);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
