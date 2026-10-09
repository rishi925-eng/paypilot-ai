import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

class PayPalClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.baseURL =
      env.PAYPAL_MODE === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";
  }

  public isMockMode(): boolean {
    return (
      !env.PAYPAL_CLIENT_ID ||
      env.PAYPAL_CLIENT_ID === "demo_paypal_client_id" ||
      !env.PAYPAL_CLIENT_SECRET ||
      env.PAYPAL_CLIENT_SECRET === "demo_paypal_client_secret"
    );
  }

  async getAccessToken(): Promise<string> {
    if (this.isMockMode()) {
      return "mock_sandbox_access_token_" + Date.now();
    }

    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");
      const response = await fetch(`${this.baseURL}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ status: response.status, body: errorText }, "PayPal Auth failed, falling back to mock mode");
        return "mock_sandbox_access_token_" + Date.now();
      }

      const data = (await response.json()) as { access_token: string; expires_in: number };
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
      return this.accessToken;
    } catch (err) {
      logger.warn({ err }, "Could not reach PayPal sandbox live API, using fallback mock token");
      return "mock_sandbox_access_token_" + Date.now();
    }
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

export const paypalClient = new PayPalClient();
