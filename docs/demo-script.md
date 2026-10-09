# PayPilot AI — 3-Minute Demo Video Script

**Target Duration**: 2m 45s

---

### [0:00 - 0:30] Introduction & Problem
- **Speaker**: "Welcome to PayPilot AI — an open-source, AI-powered commerce platform built with Next.js, Express, Prisma, LangGraph, and PayPal Sandbox."
- **Visual**: Show Storefront with product catalogue and clean developer gear cards.
- **Key point**: "Unlike basic AI demos, PayPilot enforces zero-trust pricing: the AI guides the buyer, but the backend authoritatively validates inventory and financial transactions."

---

### [0:30 - 1:15] AI Shopping Copilot in Action
- **Speaker**: "Let's click 'Ask AI Copilot' and ask: *'Compare Sony WH-1000XM5 and Bose QC45 for coding under $350'*."
- **Visual**: AI modal pops open. Show tool invocation badges (`tool: compare_products`, `tool: check_budget`).
- **Speaker**: "Notice the AI retrieves real attribute specs directly from PostgreSQL and outputs a structured quote requiring explicit customer approval."

---

### [1:15 - 2:00] PayPal Sandbox Checkout & Server-Side Capture
- **Speaker**: "Clicking 'Approve Quote & Proceed to PayPal Checkout' brings us to the secure checkout page."
- **Visual**: Show itemized order review, click the PayPal button.
- **Speaker**: "The Express backend invokes PayPal Orders API to create the transaction. Once approved, the server securely captures the payment, logs the transaction ID, decrements inventory, and issues a verified receipt."

---

### [2:00 - 2:45] Merchant Operations Hub & Telemetry
- **Speaker**: "Now let's switch to the Merchant Operations Hub."
- **Visual**: Show KPI cards, Recharts revenue curve, real-time inventory adjustments, and the audit trail.
- **Speaker**: "Only verified, captured payments are included in revenue calculations. All code is 100% open-source under the MIT license. Thank you!"
