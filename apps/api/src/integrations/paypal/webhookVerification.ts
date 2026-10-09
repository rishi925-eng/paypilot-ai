import { paypalClient } from "./client.js";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

export interface WebhookHeaders {
  "paypal-auth-algo"?: string;
  "paypal-cert-url"?: string;
  "paypal-transmission-id"?: string;
  "paypal-transmission-sig"?: string;
  "paypal-transmission-time"?: string;
}

export async function verifyPayPalWebhookSignature(
  headers: WebhookHeaders,
  body: any
): Promise<boolean> {
  if (paypalClient.isMockMode()) {
    // In mock/sandbox local mode, return verified
    return true;
  }

  try {
    const token = await paypalClient.getAccessToken();
    const url = `${paypalClient.getBaseURL()}/v1/notifications/verify-webhook-signature`;

    const payload = {
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: body,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as any;
    return data.verification_status === "SUCCESS";
  } catch (err) {
    logger.error({ err }, "Error verifying PayPal webhook signature");
    return false;
  }
}
