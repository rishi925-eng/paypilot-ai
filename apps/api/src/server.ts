import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`🚀 PayPilot AI Backend running on http://localhost:${env.PORT}`);
  logger.info(`💳 PayPal Mode: ${env.PAYPAL_MODE.toUpperCase()}`);
  logger.info(`🤖 AI Provider: ${env.AI_PROVIDER}`);
});
