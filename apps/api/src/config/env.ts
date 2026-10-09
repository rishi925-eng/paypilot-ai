import dotenv from "dotenv";
import path from "path";

// Load from root .env if available, or local .env
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "file:../../prisma/dev.db",
  PAYPAL_MODE: (process.env.PAYPAL_MODE as "sandbox" | "live") || "sandbox",
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || "demo_paypal_client_id",
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || "demo_paypal_client_secret",
  PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID || "demo_webhook_id",
  AI_PROVIDER: process.env.AI_PROVIDER || "mock", // "mock" | "ollama" | "openai"
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3.2",
  SESSION_SECRET: process.env.SESSION_SECRET || "paypilot_dev_session_secret_key_12345",
  ADMIN_API_KEY: process.env.ADMIN_API_KEY || "paypilot_admin_secret_key_123",
};
