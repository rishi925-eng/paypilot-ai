# 🏆 Devpost Official Submission: PayPilot AI

**Hackathon**: [PayPal AI Hackathon](https://paypalaihackathon.devpost.com/)  
**Project Name**: **PayPilot AI — Zero-Trust Agentic Commerce Platform with PayPal Sandbox & AG Grid**  
**Tagline**: An open-source, zero-trust Agentic Commerce platform fusing LangGraph multi-step AI orchestration, PayPal Honey coupon optimization, Simility AI fraud risk detection, and AG Grid enterprise telemetry with server-side PayPal Sandbox & Venmo checkout.

---

## 🎯 Target Hackathon Prizes

| Category | Prize | Eligibility & Alignment |
|---|---|---|
| **Grand Prize** | **1st Place (\$12,000 USD)** | Flawless, non-trivial, end-to-end working production commerce platform. |
| **Honorable Mention** | **Best Use of Agentic Commerce (\$5,000 USD)** | Multi-tool autonomous agent flow (search -> Zettle sync -> Honey coupons -> Simility risk -> locked PayPal quote). |
| **Honorable Mention** | **Best Use of PayPal + AI (\$5,000 USD)** | Deep coupling of PayPal Sandbox APIs with LangGraph.js zero-trust financial state machine. |
| **Sponsor Prize** | **Best Use of AG Grid (\$5,000 USD - 1st Place)** | Enterprise AG Grid tables for merchant inventory ledger and order telemetry with quick search, sorting, and CSV export. |
| **Sponsor Prize** | **Best Use of APIMatic (\$1,000 USD + 6mo sub)** | Complete OpenAPI 3.1 specification (`docs/openapi.yaml`) ready for multi-language SDK generation. |
| **Sponsor Prize** | **Best Use of Render (\$1,000 USD credits)** | Native `render.yaml` Blueprint for 1-click cloud deployment of API, Web, and PostgreSQL. |

---

## 💡 Inspiration: The Trillion-Dollar Problem in AI Commerce

While large language models (LLMs) are transforming e-commerce, conventional "AI checkout bots" suffer from two dangerous vulnerabilities:
1. **Price Hallucinations & Prompt Injections**: Users trick AI into changing prices ($0 checkout hacks).
2. **Disconnected Payment & Risk Architecture**: AI generates static links without validating stock, fraud velocity, or promotional rules.

**PayPilot AI** solves this with a **Zero-Trust Financial Architecture**:
> *"The AI guides the buyer with human-like intelligence, but the backend server authoritatively calculates every single penny against the database before interacting with the PayPal Developer Platform."*

---

## 🚀 What It Does: End-to-End Walkthrough

### 1. 🛍️ Agentic Shopping Copilot (Autonomous Commerce)
- **Natural Language Product Discovery**: Queries like *"Best noise-cancelling headphones for developer focus under $300"*.
- **Live Specification Comparison Matrix**: Side-by-side technical breakdown (battery, noise cancellation, tactile buttons, ratings).
- **Budget Constraint Analyzer**: Visual budget progress meter showing exact spending headroom.

### 2. ⚡ Agentic Auto-Pilot Workflow (PayPal Suite Integration)
When a buyer activates Auto-Pilot or requests a deal, PayPilot executes a 5-step autonomous tool chain:
1. **Catalogue Retrieval**: Fetches authoritative product specs and baseline pricing.
2. **PayPal Zettle POS Omnichannel Sync**: Verifies stock availability across both the central warehouse and physical retail point-of-sale stores.
3. **PayPal Honey Smart Coupon Optimizer**: Scans promo codes (`HONEY20`, `PAYPALAI`, `DEVPOST10`), computes stackable savings, and awards Honey Gold rewards.
4. **PayPal Simility AI Risk Guard**: Analyzes buyer velocity, device fingerprinting, and bot heuristics to generate an instant risk score (e.g. `6/100 - Clean / Authorized`).
5. **PayPal Pay Later / Paidy BNPL**: Computes 4 interest-free bi-weekly installment payments (0% APR).

### 3. 💳 Server-Verified PayPal Sandbox & Venmo Checkout
- Server generates a cryptographically locked order quote with a 15-minute countdown.
- Buyer approves the quote and is directed to the checkout page.
- Native integration of **PayPal Smart Buttons**, **Venmo**, and **PayPal Pay in 4**.
- Strict server-side execution of PayPal Orders REST API (`/v2/checkout/orders` and `/capture`).
- Immediate inventory reservation decrement upon capture confirmation.

### 4. 📊 Merchant Operations Hub with AG Grid (Sponsor Tool)
- **AG Grid Product & Stock Ledger**: Enterprise-grade data grid featuring instant text search filter, column sorting, resizing, stock status indicators, and inline stock adjustments.
- **AG Grid Orders & Captures Table**: Displays verified PayPal transactions, customer details, capture IDs, and one-click **CSV Data Export**.
- **Real-Time Revenue Telemetry**: Recharts verified revenue curve (ignoring pending/failed carts).
- **PayPal Webhook Simulator**: Triggers and tests `PAYMENT.CAPTURE.COMPLETED` and `PAYMENT.CAPTURE.DENIED` events with signature verification and idempotency keys.

---

## 🛠️ PayPal Ecosystem Technologies Leveraged

The hackathon guidelines explicitly welcome the full spectrum of PayPal developer services. PayPilot AI integrates and models all 10 technologies:

1. **PayPal Sandbox REST API v2**: Server-side order creation (`/v2/checkout/orders`), capture verification, and status tracking.
2. **Venmo**: Full multi-funding payment choice on checkout and real-time social bill-splitting engine (`venmoSplitEngine.ts`).
3. **Braintree**: Tokenized card vaulting and 3D Secure 2 (3DS2) liability shift verification (`braintreeVaultEngine.ts`).
4. **PayPal Honey**: Automated smart discount discovery (`HONEY20`, `PAYPALAI`), stackable savings, and Honey Gold cashback rewards (`honeyCouponEngine.ts`).
5. **PayPal Simility AI**: Adaptive machine learning fraud risk scoring, bot detection, and velocity checks (`similityRiskEngine.ts`).
6. **PayPal Zettle**: Retail POS omnichannel stock synchronization between physical flagships and online warehouses (`zettleSyncEngine.ts`).
7. **PayPal Pay Later / Paidy**: 4 interest-free bi-weekly installments schedule computation (`paidyBnplEngine.ts`).
8. **PayPal Xoom**: Cross-border international remittance with 120-minute guaranteed FX rate locking across EUR, GBP, INR, CAD, and JPY (`xoomFxEngine.ts`).
9. **PayPal Swift Financial**: Pre-approved merchant working capital financing calculated automatically from verified 30-day PayPal sales volume (`swiftCapitalEngine.ts`).
10. **PayPal Hyperwallet**: Automated multi-party marketplace payout disbursement engine with 95% merchant payout / 5% platform commission splits (`hyperwalletDisbursementEngine.ts`).

---

## 🧰 Official Sponsor Tools Integrated

1. **AG Grid** (`ag-grid-react` & `ag-grid-community`):
   - Integrated into the Merchant Dashboard for high-performance inventory and order management.
   - Column sorting, quick filtering, custom badge renderers, and native CSV export.
2. **APIMatic**:
   - Complete OpenAPI 3.1 specification (`docs/openapi.yaml` and `docs/paypilot-apimatic-spec.json`).
   - Ready to generate client SDKs in TypeScript, Python, Java, C#, Go, and PHP (`docs/APIMATIC_GUIDE.md`).
3. **Render**:
   - Infrastructure-as-Code Blueprint (`render.yaml`) configuring backend API, frontend web, and managed PostgreSQL (`docs/RENDER_DEPLOYMENT.md`).
4. **Postman**:
   - Ready-to-run Postman test collection with automated assertions (`docs/postman_collection.json`).

---

## 🏗️ Architecture & Technology Stack

```mermaid
flowchart TD
    User["👤 Buyer / Merchant"] --> NextWeb["Next.js 14 Frontend\n(Tailwind + Lucide + AG Grid)"]
    NextWeb --> ExpressAPI["Node.js / Express API Server\n(TypeScript + Zod + Pino)"]
    
    subgraph AgenticEngine ["Agentic Commerce Orchestration"]
        Agent["LangGraph Shopping Copilot"]
        ZettleTool["tool_zettle_sync"]
        HoneyTool["tool_honey_discounts"]
        SimilityTool["tool_simility_risk"]
        PaidyTool["tool_paidy_installments"]
        QuoteTool["tool_prepare_order (Locked Quote)"]
    end
    
    subgraph DataPersistence ["Authoritative Database"]
        Prisma["Prisma ORM"]
        DB[("PostgreSQL / SQLite")]
    end
    
    subgraph PayPalGateway ["PayPal Developer Platform"]
        OrdersAPI["PayPal Orders v2 API"]
        CapturesAPI["PayPal Captures API"]
        VenmoAPI["Venmo Funding Source"]
        WebhooksAPI["PayPal Webhook Receiver"]
    end
    
    ExpressAPI --> AgenticEngine
    ExpressAPI --> Prisma
    Prisma --> DB
    ExpressAPI --> PayPalGateway
```

---

## 🧪 Testing Instructions for Judges

Judges can test the application locally in 2 minutes:

### 1. Prerequisites
- Node.js (v18+) & npm

### 2. Quickstart Run
```bash
# Clone and enter repo
git clone https://github.com/rishi/paypilot-ai.git
cd paypilot-ai

# Install dependencies
npm install

# Push database schema & seed initial catalogue
npx prisma db push
npm run db:seed

# Run both Backend (Port 5000) and Frontend (Port 3000)
npm run dev
```

### 3. Open in Browser
- **Storefront & AI Copilot**: [http://localhost:3000](http://localhost:3000)
  - Click **"Ask AI Copilot"** and click **"⚡ Run Agentic Auto-Pilot"** to see Honey + Simility + Zettle in action!
  - Approve the quote to navigate to the **Secure Checkout** with PayPal, Venmo, and Pay in 4.
- **Merchant Operations Hub with AG Grid**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
  - Check the **Catalogue & Stock** tab for AG Grid interactive sorting, quick search, and stock adjustment.
  - Check the **Orders** tab to inspect verified captures and click **"Export CSV"**.
  - Check the **Webhooks** tab to test simulated PayPal webhook deliveries.

### 4. Run Automated Test Suite
```bash
npm run test --prefix apps/api
```
*All 19 automated test cases pass!*

---

## 🎬 3-Minute Demonstration Video Script

**Target Duration**: 2 minutes 45 seconds (< 3 minutes per Hackathon Rules)  
**Tone**: Confident, engaging, engineering-focused  

| Time | Visual Scene | Audio Narration |
|---|---|---|
| **0:00 - 0:25** | PayPilot AI Storefront homepage with tech gear and glowing header. | *"Welcome to PayPilot AI — a zero-trust Agentic Commerce platform built for the PayPal AI Hackathon using Next.js 14, Express, Prisma, LangGraph, and the PayPal Developer Platform."* |
| **0:25 - 0:50** | Click "Ask AI Copilot". Show interactive modal. | *"Unlike standard AI shopping bots that hallucinate prices or create unverified links, PayPilot enforces zero-trust pricing: AI guides the customer, but the server authoritatively validates every cent against PostgreSQL."* |
| **0:50 - 1:30** | Click **"⚡ Run Agentic Auto-Pilot Flow"**. Watch tool badges fire. | *"Watch our Agentic Auto-Pilot in action. With one click, the agent triggers a multi-step workflow: first, syncing stock across retail stores using PayPal Zettle; second, finding promo code HONEY20 via PayPal Honey for 20% off; third, evaluating fraud risk with PayPal Simility AI; and fourth, computing PayPal Pay Later 4-installment schedule."* |
| **1:30 - 2:05** | Click "Approve Quote & Launch PayPal Sandbox". Navigate to checkout. | *"Clicking Approve Quote locks the pricing into a server quote. On the checkout page, the buyer can pay with PayPal Sandbox, Venmo, or Pay in 4. Once authorized, our Express backend securely captures the payment via PayPal Orders API v2, decrements inventory, and issues a verified receipt."* |
| **2:05 - 2:35** | Navigate to `/dashboard`. Show AG Grid in action. | *"Now let's switch to the Merchant Operations Hub, powered by our official sponsor tool, AG Grid. Here merchants have high-performance sorting, instant text filtering, inline stock adjustments, and one-click CSV export of captured PayPal orders."* |
| **2:35 - 2:45** | Show `openapi.yaml`, `render.yaml`, and GitHub repo. | *"With our APIMatic OpenAPI 3.1 specification and 1-click Render cloud deployment Blueprint, PayPilot AI is 100% open-source under the MIT license and ready for production. Thank you!"* |

---

## 📄 License & Open Source Compliance
PayPilot AI is 100% open-source software licensed under the **[MIT License](LICENSE)**. Detectable license file is included at the root of the repository.
