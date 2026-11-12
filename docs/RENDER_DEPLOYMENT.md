# 🚀 PayPilot AI — Render Cloud Deployment Guide

> **Sponsor Prize Eligibility**: Best Use of Render ($1,000 USD / $750 / $500 Credits)

## 📌 Overview
PayPilot AI is configured with a native **Render Blueprint** (`render.yaml`), enabling complete one-click provisioning of:
1. **`paypilot-api`**: Express + TypeScript AI & PayPal Backend Web Service with active `/health` liveness checks.
2. **`paypilot-web`**: Next.js 14 Web Storefront & Merchant Operations Hub with AG Grid.
3. **`paypilot-db`**: Managed PostgreSQL Database.

---

## ⚡ 1-Click Deployment Instructions

### Step 1: Connect Repository to Render
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Blueprint**.
3. Connect your public GitHub repository (`paypilot-ai`).

### Step 2: Review Blueprint Architecture
Render will automatically detect `render.yaml` at the root of the repository and configure:
- **Web Service 1**: `paypilot-api` (Port 5000)
- **Web Service 2**: `paypilot-web` (Port 3000)
- **Database**: `paypilot-db` (PostgreSQL)

### Step 3: Set Environment Variables (Optional Live Sandbox)
If you want to use live PayPal Developer sandbox credentials instead of the built-in mock mode:
- Set `PAYPAL_CLIENT_ID` to your Sandbox Client ID from [PayPal Developer Dashboard](https://developer.paypal.com/).
- Set `PAYPAL_CLIENT_SECRET` to your Sandbox Secret.
- If left as defaults (`demo_paypal_client_id`), PayPilot AI runs in instantaneous offline sandbox mock mode for judging verification!

### Step 4: Click "Apply"
Render will build both services, run Prisma migrations, seed the initial tech catalogue, and launch both frontend and backend.
