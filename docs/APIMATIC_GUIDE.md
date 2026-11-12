# 🛠️ PayPilot AI — APIMatic Integration Guide

> **Sponsor Prize Eligibility**: Best Use of APIMatic ($1,000 USD + 6 Months Business Subscription)

## 📌 Overview
**APIMatic** empowers API providers to generate developer SDKs in multiple programming languages, validate API design specifications, and automatically publish developer portals.

PayPilot AI provides a fully-compliant **OpenAPI 3.1.0** specification (`docs/openapi.yaml` and `docs/paypilot-apimatic-spec.json`) designed specifically for APIMatic's SDK CodeGen engine and documentation portal.

---

## 🚀 How to Generate Multi-Language SDKs with APIMatic

### 1. Import OpenAPI Spec into APIMatic
1. Navigate to [APIMatic Dashboard](https://www.apimatic.io/dashboard).
2. Click **Import API** and select `docs/openapi.yaml` or paste the raw JSON from `docs/paypilot-apimatic-spec.json`.
3. APIMatic will validate the API definitions, path parameters, request bodies, and zero-trust schema models.

### 2. Available Target Languages
Using APIMatic, client SDKs can be generated in one click for:
- 🐍 **Python**: `pip install paypilot-client`
- 🟦 **TypeScript / Node.js**: `npm install @paypilot/sdk`
- ☕ **Java**: `com.paypilot:api-sdk`
- 🔷 **C# / .NET**: `Install-Package PayPilot.Client`
- 🐹 **Go**: `go get github.com/paypilot/go-sdk`
- 🐘 **PHP**: `composer require paypilot/sdk`

---

## 💡 Example: Using Generated TypeScript SDK for Agentic Checkout

```typescript
import { PayPilotClient } from "@paypilot/sdk";

const client = new PayPilotClient({
  environment: "sandbox",
  serverUrl: "http://localhost:5000",
});

// 1. Invoke Agentic Shopping Copilot
const agentResult = await client.ai.chat({
  message: "Run agentic checkout for Sony headphones with best honey discount",
});

console.log("Honey Discount Code:", agentResult.quote.couponCode);
console.log("Simility AI Risk Score:", agentResult.quote.similityRiskScore);

// 2. Authorize via PayPal Sandbox
const ppOrder = await client.payments.createPaypalOrder({
  orderId: agentResult.quote.quoteId,
});

// 3. Capture verified funds
const capture = await client.payments.capturePaypalOrder({
  orderId: agentResult.quote.quoteId,
  paypalOrderId: ppOrder.data.paypalOrderId,
});

console.log("Payment Captured Successfully:", capture.data.status);
```

---

## 🛡️ API Design Best Practices Enforced
- **Zero-Trust Pricing**: Subtotals and discounts are strictly validated on the server.
- **Idempotency**: All payment and webhook calls feature idempotency keys.
- **Typed Responses**: Complete JSON schemas for all entities (Products, Quotes, Payments, Orders, Telemetry).
