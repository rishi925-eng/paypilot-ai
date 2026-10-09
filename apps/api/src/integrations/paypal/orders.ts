import { paypalClient } from "./client.js";
import { logger } from "../../config/logger.js";

export interface CreateOrderPayload {
  intent: "CAPTURE";
  purchase_units: Array<{
    reference_id?: string;
    description?: string;
    amount: {
      currency_code: string;
      value: string;
      breakdown?: {
        item_total?: { currency_code: string; value: string };
        tax_total?: { currency_code: string; value: string };
        shipping?: { currency_code: string; value: string };
      };
    };
    items?: Array<{
      name: string;
      unit_amount: { currency_code: string; value: string };
      quantity: string;
      description?: string;
    }>;
    shipping?: {
      name?: { full_name: string };
      address?: {
        address_line_1: string;
        address_line_2?: string;
        admin_area_2: string;
        admin_area_1: string;
        postal_code: string;
        country_code: string;
      };
    };
  }>;
}

export async function createPayPalOrder(payload: CreateOrderPayload): Promise<{ id: string; status: string; links?: any[] }> {
  if (paypalClient.isMockMode()) {
    const mockId = "MOCK-PP-ORD-" + Math.floor(100000 + Math.random() * 900000);
    logger.info({ mockId, payload }, "[PayPal Mock] Created sandbox order");
    return {
      id: mockId,
      status: "CREATED",
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=${mockId}`,
          rel: "approve",
          method: "GET",
        },
      ],
    };
  }

  const token = await paypalClient.getAccessToken();
  const url = `${paypalClient.getBaseURL()}/v2/checkout/orders`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as any;
  if (!response.ok) {
    logger.error({ status: response.status, data }, "PayPal Create Order API returned error");
    throw new Error(data.message || "Failed to create PayPal order");
  }

  return data;
}

export async function capturePayPalOrder(paypalOrderId: string): Promise<any> {
  if (paypalClient.isMockMode() || paypalOrderId.startsWith("MOCK-PP-")) {
    const captureId = "MOCK-CAPTURE-" + Math.floor(100000 + Math.random() * 900000);
    logger.info({ paypalOrderId, captureId }, "[PayPal Mock] Successfully captured order");
    return {
      id: paypalOrderId,
      status: "COMPLETED",
      payment_source: {
        paypal: {
          email_address: "buyer-sandbox@paypilot.io",
          account_id: "SANDBOX_MOCK_BUYER",
          name: { given_name: "Alex", surname: "Customer" },
        },
      },
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: captureId,
                status: "COMPLETED",
                amount: { currency_code: "USD", value: "100.00" },
                final_capture: true,
                create_time: new Date().toISOString(),
                update_time: new Date().toISOString(),
              },
            ],
          },
        },
      ],
    };
  }

  const token = await paypalClient.getAccessToken();
  const url = `${paypalClient.getBaseURL()}/v2/checkout/orders/${paypalOrderId}/capture`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as any;
  if (!response.ok) {
    logger.error({ status: response.status, data }, "PayPal Capture Order API returned error");
    throw new Error(data.message || "Failed to capture PayPal order");
  }

  return data;
}
