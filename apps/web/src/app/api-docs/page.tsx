"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Download,
  BookOpen,
  ShieldCheck,
  Zap,
  Server,
  Layers,
  Sparkles,
} from "lucide-react";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/products",
    title: "List Catalogue Products",
    description: "Returns paginated catalogue products with filtering by category, search query, and price range.",
    params: "?category=Audio&q=Sony&minPrice=100&maxPrice=500",
    response: `{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "cmv0jp0i40002d52omlxede9r",
      "name": "Sony WH-1000XM5",
      "slug": "sony-wh-1000xm5",
      "category": "Audio",
      "price": 349.99,
      "stock": 25,
      "rating": 4.8
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/api/ai/chat",
    title: "Execute Agentic Commerce Toolchain",
    description: "Initiates multi-step autonomous tool execution across Zettle POS, Honey coupons, and Simility fraud checks.",
    params: "Body: { message: string, sessionId?: string }",
    response: `{
  "reply": "I've locked in the best price for your Sony WH-1000XM5...",
  "reasoningSteps": [
    { "step": 1, "tool": "tool_zettle_sync", "output": { "inStock": true, "total": 25 } },
    { "step": 2, "tool": "tool_honey_discounts", "output": { "code": "HONEY20", "savings": 70 } },
    { "step": 3, "tool": "tool_simility_risk", "output": { "score": 5, "decision": "APPROVED" } },
    { "step": 4, "tool": "tool_prepare_order", "output": { "quoteId": "Q-8819", "expiresIn": 900 } }
  ]
}`,
  },
  {
    method: "POST",
    path: "/api/payments/create-paypal-order",
    title: "Create PayPal Sandbox Order",
    description: "Strict server-side creation of PayPal Orders API v2 transaction payload. Re-validates database price totals.",
    params: "Body: { orderId: string }",
    response: `{
  "success": true,
  "paypalOrderId": "MOCK-PP-ORD-671704",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=MOCK-PP-ORD-671704",
  "status": "CREATED"
}`,
  },
  {
    method: "POST",
    path: "/api/payments/capture-paypal-order",
    title: "Capture PayPal Sandbox Order",
    description: "Captures authorized funds, commits inventory decrement, and records audit trail.",
    params: "Body: { orderId: string, paypalOrderId: string }",
    response: `{
  "success": true,
  "captureId": "MOCK-CAPTURE-738338",
  "status": "COMPLETED",
  "orderStatus": "COMPLETED"
}`,
  },
  {
    method: "POST",
    path: "/api/webhooks/paypal",
    title: "Idempotent PayPal Webhook Ingestion",
    description: "Validates HMAC transmission signature and deduplicates webhook processing before mutating order states.",
    params: "Headers: { 'paypal-transmission-sig': '...' }",
    response: `{
  "received": true,
  "status": "PROCESSED",
  "idempotencyCached": true
}`,
  },
  {
    method: "GET",
    path: "/api/analytics/dashboard",
    title: "Merchant Telemetry & Operations Dataset",
    description: "Aggregates revenue curve, stock levels, low-stock alerts, and Swift Capital underwriting limits.",
    params: "Header: x-admin-key: paypilot_admin_secret_key_123",
    response: `{
  "revenue": 4416.15,
  "ordersCount": 3,
  "lowStockAlerts": 4,
  "swiftCapitalEligible": 15000
}`,
  },
];

export default function ApiDocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-slate-800 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Code2 className="w-4 h-4" />
              <span>Interactive OpenAPI 3.1 Ready</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              PayPilot Developer API Documentation
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Zero-trust server-authoritative financial endpoints powering the storefront, AI shopping copilot, and PayPal Sandbox orchestration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="http://localhost:5000/health"
              target="_blank"
              rel="noreferrer"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2"
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>API Healthcheck</span>
            </a>
            <Link
              href="/dashboard"
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-2"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Merchant Console</span>
            </Link>
          </div>
        </div>

        {/* Architecture Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              📄
            </div>
            <div>
              <div className="text-sm font-bold text-white">OpenAPI 3.1 Specification</div>
              <div className="text-[11px] text-slate-400">Standardized API contracts &amp; models</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <div className="text-sm font-bold text-white">Automated Contract Tests</div>
              <div className="text-[11px] text-slate-400">Complete end-to-end payment test suite</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ☁️
            </div>
            <div>
              <div className="text-sm font-bold text-white">Infrastructure as Code</div>
              <div className="text-[11px] text-slate-400">Declarative cloud deployment ready</div>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-white">Key Service Endpoints</h2>

          <div className="space-y-5">
            {ENDPOINTS.map((ep, idx) => (
              <div
                key={ep.path}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl"
              >
                <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        ep.method === "GET"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-bold text-white">{ep.path}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{ep.title}</span>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-300">{ep.description}</p>
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-slate-300">Parameters: </strong>
                    {ep.params}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                        Sample JSON Response
                      </span>
                      <button
                        onClick={() => handleCopy(ep.response, idx)}
                        className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                      {ep.response}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
