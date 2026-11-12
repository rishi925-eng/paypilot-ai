"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Globe,
  Users,
  CreditCard,
  Building,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Code2,
  CheckCircle2,
  Terminal,
  Server,
  Lock,
  Cpu,
  RefreshCw,
  Award,
} from "lucide-react";

const PAYPAL_ECOSYSTEM = [
  {
    name: "PayPal Sandbox REST API v2",
    badge: "Core Gateway",
    color: "from-blue-600 to-indigo-600",
    border: "border-blue-500/40",
    description: "Strict server-authoritative checkout execution (`/v2/checkout/orders` & `/capture`). Prevents client-side price tampering or discount injection.",
    tech: "POST /v2/checkout/orders, 2-legged OAuth 2.0, Idempotency keys",
    link: "https://developer.paypal.com/docs/api/orders/v2/",
    status: "Active · Sandbox Verified",
  },
  {
    name: "Venmo Social Commerce",
    badge: "P2P & Split",
    color: "from-sky-500 to-blue-600",
    border: "border-sky-500/40",
    description: "Group purchase orchestration and AI-generated social payment links with customizable friend handles for multi-payer bill splitting.",
    tech: "Deep link schema `venmo://paycharge`, proportional subtotal split calculation",
    link: "https://developer.paypal.com/docs/multiparty/alternative-payment-methods/venmo/",
    status: "Enabled · Real-time Split",
  },
  {
    name: "Braintree Hosted Fields & Vault",
    badge: "Card Tokenization",
    color: "from-emerald-600 to-teal-600",
    border: "border-emerald-500/40",
    description: "PCI DSS Level 1 compliant tokenized card vaulting. Zero raw card numbers touch merchant databases, reducing compliance overhead to zero.",
    tech: "Braintree v1 GraphQL API, 3D Secure 2.0 SCA authentication",
    link: "https://developer.paypal.com/braintree/docs",
    status: "Tokenized · Zero-Knowledge",
  },
  {
    name: "PayPal Honey Smart Coupons",
    badge: "Autonomous Savings",
    color: "from-amber-500 to-orange-600",
    border: "border-amber-500/40",
    description: "Auto-coupon optimization engine with stackable discount detection (`HONEY20`, `PAYPALAI`, `DEVPOST10`) and Honey Gold rewards tracking.",
    tech: "Automated promo discovery engine, subtotal bounds validator",
    link: "https://www.joinhoney.com/",
    status: "Live · Stackable Logic",
  },
  {
    name: "PayPal Simility AI Risk Guard",
    badge: "Real-time Fraud Defense",
    color: "from-rose-600 to-red-700",
    border: "border-rose-500/40",
    description: "Machine learning fraud defense evaluating device fingerprints, IP proxy risk, and user checkout velocity before orders reach the PayPal gateway.",
    tech: "Sub-50ms heuristic scoring (0-100 threshold), automated decision matrix",
    link: "https://www.paypal.com/us/enterprise/fraud-protection",
    status: "Active · Zero Tolerance",
  },
  {
    name: "PayPal Zettle POS Sync",
    badge: "Omnichannel Stock",
    color: "from-violet-600 to-purple-700",
    border: "border-violet-500/40",
    description: "Unified inventory synchronizer consolidating in-store retail counter stock with digital warehouse availability to prevent overselling.",
    tech: "Zettle Inventory API v1, delta sync, atomic decrement locks",
    link: "https://developer.zettle.com/",
    status: "Synchronized · Multi-location",
  },
  {
    name: "PayPal Paidy & Pay Later BNPL",
    badge: "Flexible Credit",
    color: "from-cyan-500 to-teal-600",
    border: "border-cyan-500/40",
    description: "0% APR bi-weekly installment plan calculator and Japanese Paidy post-pay integration with automated merchant ledger settlement.",
    tech: "4-installment schedule engine, real-time credit eligibility check",
    link: "https://developer.paypal.com/docs/checkout/pay-later/",
    status: "Active · 0% APR Verified",
  },
  {
    name: "PayPal Xoom FX Cross-Border",
    badge: "Currency Lock",
    color: "from-indigo-500 to-blue-700",
    border: "border-indigo-500/40",
    description: "Cross-border conversion engine providing 120-minute exchange rate locks for EUR (€), GBP (£), and INR (₹) with zero transfer fees.",
    tech: "Real-time FX pipeline, locked rate guarantee timestamping",
    link: "https://www.xoom.com/",
    status: "120m Locked Rates",
  },
  {
    name: "PayPal Swift Financial Capital",
    badge: "Merchant Underwriting",
    color: "from-emerald-500 to-green-700",
    border: "border-emerald-500/40",
    description: "Automated working capital loan underwriting based on verified PayPal sandbox transaction volume with automated repayment deductions.",
    tech: "Automated underwriting algorithm, revenue-share repayment schedule",
    link: "https://www.paypal.com/us/business/loans-and-credit",
    status: "Instant Pre-approval",
  },
  {
    name: "PayPal Hyperwallet Payouts",
    badge: "Marketplace Splits",
    color: "from-amber-600 to-yellow-600",
    border: "border-amber-500/40",
    description: "Programmatic marketplace disbursements automatically splitting checkout proceeds: 95% merchant net deposit and 5% platform royalty.",
    tech: "Hyperwallet REST API v4, multi-currency wallet ledger",
    link: "https://developer.hyperwallet.com/",
    status: "Automated Payout Engine",
  },
];

const CORE_PILLARS = [
  {
    name: "Real-time Operations",
    role: "Merchant Operations & Inventory",
    description: "High-performance data management powering the merchant product inventory ledger and order tracking tables with quick search, column sorting, and CSV export.",
    badge: "Enterprise Ready",
    href: "/dashboard",
  },
  {
    name: "API First Contracts",
    role: "Universal Schema & Contract Engine",
    description: "Complete machine-readable specifications enabling reliable client applications, zero-drift interfaces, and seamless integration.",
    badge: "Strict Validation",
    href: "/api-docs",
  },
  {
    name: "Verified Security Suite",
    role: "Contract Verification & Fraud Guard",
    description: "Comprehensive automated test suites for all payment endpoints, cart management, inventory webhooks, and risk heuristics.",
    badge: "High Security",
    href: "/checkout",
  },
  {
    name: "Cloud Architecture",
    role: "Resilient Microservices Infrastructure",
    description: "Zero-downtime resilient cloud deployment for the backend API, responsive storefront web application, and verified ledger storage.",
    badge: "High Availability",
    href: "/products",
  },
];

export default function AboutPage() {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950/40 via-slate-950 to-slate-950 border-b border-slate-800/80 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-brand-300">
            <Award className="w-4 h-4 text-brand-400" />
            <span>Enterprise E-Commerce &amp; Payment Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            PayPal-Grade Architecture.<br />
            <span className="bg-gradient-to-r from-brand-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Zero-Trust Autonomous Commerce.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            PayPilot AI unites ten developer services from the PayPal ecosystem with an agentic AI copilot and server-authoritative financial ledger, eliminating price hallucinations and checkout fraud.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/checkout"
              className="bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center space-x-2"
            >
              <span>Test PayPal Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center space-x-2"
            >
              <span>Merchant Operations Hub</span>
              <Terminal className="w-4 h-4 text-cyan-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Enterprise Security Principles
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Engineered around the strict compliance and reliability standards demanded by global financial networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-7 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white">Zero-Trust Server Pricing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Client requests and AI tool prompts are never trusted for payment values. Every line item, discount code, and tax computation is authoritatively validated by the Node.js/Express server against the database.
            </p>
            <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30">
              100% immune to $0 prompt-injection hacks
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-7 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white">Autonomous Multi-Step Reasoning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The AI copilot employs a multi-step execution pipeline: specs analysis → Zettle stock sync → Honey coupon verification → Simility risk check → cryptographically locked 15-minute quote generation.
            </p>
            <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/30">
              Full transparency with visual tool traces
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-7 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white">Idempotent Webhooks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every incoming PayPal sandbox webhook (`PAYMENT.CAPTURE.COMPLETED`) undergoes signature verification and database deduplication to prevent double-crediting or duplicate fulfillment events.
            </p>
            <div className="text-[11px] font-mono text-brand-300 bg-brand-950/40 p-2.5 rounded-xl border border-brand-500/30">
              SHA-256 HMAC & event ID caching
            </div>
          </div>
        </div>
      </section>

      {/* 10 PayPal Services Grid */}
      <section className="bg-slate-900/40 border-y border-slate-800/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-400 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Ecosystem Coverage</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              The 10 PayPal Developer Services Integrated
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Every service operates in a synchronized loop—from buyer intent and fraud screening to checkout capture and merchant payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {PAYPAL_ECOSYSTEM.map((svc) => (
              <div
                key={svc.name}
                className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 shadow-xl space-y-4 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                      {svc.badge}
                    </span>
                    <h3 className="text-lg font-black text-white mt-1.5">{svc.name}</h3>
                  </div>
                  <a
                    href={svc.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{svc.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Implementation</div>
                  <div className="text-[11px] font-mono text-cyan-300 bg-slate-950 p-2 rounded-xl border border-slate-800/80 truncate">
                    {svc.tech}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-emerald-400 font-bold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {svc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Infrastructure Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Core Infrastructure Pillars
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Engineered with modern architecture to guarantee reliability, security, and enterprise telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_PILLARS.map((sp) => (
            <div
              key={sp.name}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                  {sp.badge}
                </span>
                <h3 className="font-extrabold text-base text-white">{sp.name}</h3>
                <div className="text-xs font-semibold text-slate-400">{sp.role}</div>
                <p className="text-xs text-slate-400 leading-relaxed pt-1">{sp.description}</p>
              </div>

              <Link
                href={sp.href}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center pt-3 border-t border-slate-800 transition-colors"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brand-950 via-slate-900 to-cyan-950 border-t border-slate-800 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Experience PayPilot AI in Action
          </h2>
          <p className="text-sm text-slate-300">
            Simulate a full agentic shopping journey, inspect live PayPal sandbox transaction payloads, or review the merchant inventory telemetry.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              Explore Storefront
            </Link>
            <Link
              href="/dashboard"
              className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl border border-slate-700 transition-all"
            >
              Open Merchant Operations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
