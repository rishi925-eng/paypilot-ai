# 🚀 PayPilot AI

**PayPilot AI** is an open-source, AI-powered commerce and payment platform engineered with **Next.js 14**, **Node.js/Express**, **Prisma ORM & PostgreSQL**, **LangGraph.js**, and robust server-side **PayPal Sandbox** integration.

---

## ✨ Key Features

- 🛍️ **Smart AI Shopping Assistant**: Natural language product discovery, multi-product comparisons, budget constraints calculation, and quote generation using LangGraph.js workflows.
- 💳 **Reliable PayPal Checkout Engine**: Strict server-side order creation, buyer approval, payment capture verification, idempotency handling, and webhook signature verification.
- 📊 **Merchant Analytics Dashboard**: Real-time sales insights, inventory adjustments, verified revenue analytics (Recharts), order tracking, and AI search trends.
- 🛡️ **Zero-Trust Pricing Architecture**: Prices and stock are authoritative from the backend database—never trusted from client or AI generated inputs.
- 🦙 **Pluggable AI Runtime**: Works seamlessly with local Ollama models (e.g. Llama 3.2), mock AI mode for instantaneous offline testing, or OpenAI-compatible endpoints.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS, Lucide Icons, Recharts, TanStack Table |
| **Backend** | Express.js, TypeScript, Zod, Pino Logger, Supertest, Vitest |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **AI Orchestration** | LangGraph.js, Ollama |
| **Payments** | PayPal JS SDK, PayPal Orders & Webhook REST APIs |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js (v18+)
- npm or pnpm
- (Optional) PostgreSQL or local SQLite & Ollama

### 2. Installation
```bash
# Clone repository
git clone https://github.com/your-username/paypilot-ai.git
cd paypilot-ai

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install
```

### 3. Database Setup
```bash
# Push Prisma schema to DB & Seed initial catalogue
npx prisma db push
npm run db:seed
```

### 4. Running the Development Servers
```bash
npm run dev
```
- Storefront & Assistant: [http://localhost:3000](http://localhost:3000)
- Merchant Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- Backend API: [http://localhost:5000](http://localhost:5000)

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
