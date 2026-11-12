import React from "react";
import Link from "next/link";
import {
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Code2,
  Sparkles,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Static Data                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const FOOTER_COLUMNS = [
  {
    title: "Storefront",
    links: [
      { label: "Home",              href: "/" },
      { label: "Products Catalogue",href: "/products" },
      { label: "Flash Deals",       href: "/deals" },
      { label: "Wishlist",          href: "/wishlist" },
      { label: "Shopping Cart",     href: "/cart" },
      { label: "Checkout",          href: "/checkout" },
    ],
  },
  {
    title: "Merchant & Dev",
    links: [
      { label: "Operations Hub",      href: "/dashboard" },
      { label: "API Reference",       href: "/api-docs" },
      { label: "Postman Collection",  href: "https://www.postman.com/",  external: true },
      { label: "OpenAPI 3.0 Spec",    href: "/api-docs#openapi" },
      { label: "Developer SDKs",      href: "/api-docs" },
      { label: "Architecture",        href: "/about" },
    ],
  },
  {
    title: "PayPal Ecosystem",
    links: [
      { label: "PayPal Sandbox",   href: "https://www.sandbox.paypal.com/", external: true },
      { label: "Venmo Social",     href: "https://venmo.com/",              external: true },
      { label: "Braintree Vault",  href: "https://www.braintreepayments.com/", external: true },
      { label: "Honey Coupons",    href: "https://www.joinhoney.com/",      external: true },
      { label: "Simility AI",      href: "https://www.paypal.com/us/enterprise/fraud-protection", external: true },
      { label: "Zettle POS",       href: "https://www.zettle.com/",         external: true },
      { label: "Paidy BNPL",       href: "https://paidy.com/",              external: true },
      { label: "Xoom FX",          href: "https://www.xoom.com/",           external: true },
      { label: "Swift Financial",  href: "https://www.paypal.com/us/business/loans-and-credit", external: true },
      { label: "Hyperwallet",      href: "https://www.hyperwallet.com/",    external: true },
    ],
  },
];

const TRUST_PILLARS = [
  { label: "PCI-DSS Level 1",  badge: "Certified", emoji: "🔒" },
  { label: "256-bit TLS Encryption", badge: "Protected", emoji: "🛡️" },
  { label: "Simility AI Fraud Guard", badge: "Real-time", emoji: "⚡" },
  { label: "Instant Capture", badge: "Verified", emoji: "✓" },
];

const SECURITY_BADGES = [
  "End-to-End Encryption", "Zero-Trust Pricing", "Multi-Currency Ready", "Instant Settlement",
  "Fraud Protection", "24/7 Monitoring", "Automated Receipts",
];

const SOCIAL_LINKS = [
  { href: "https://github.com/", icon: Github,   label: "GitHub",    hover: "hover:bg-slate-700 hover:text-white" },
  { href: "https://linkedin.com/", icon: Linkedin, label: "LinkedIn",  hover: "hover:bg-blue-600 hover:text-white" },
  { href: "https://twitter.com/",  icon: Twitter,  label: "Twitter/X", hover: "hover:bg-sky-500 hover:text-white" },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Sub-components                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
function FooterLink({
  href,
  label,
  external = false,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const cls =
    "group inline-flex items-center gap-1 text-slate-500 hover:text-slate-200 transition-colors duration-200 text-xs font-medium";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {label}
        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {label}
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main Footer                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/60 mt-20 pb-28 sm:pb-24 print:hidden no-print">

      {/* ── Newsletter / CTA Banner ── */}
      <div className="border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-brand-500/20 rounded-2xl px-7 py-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-black text-white text-base">Stay ahead with PayPilot AI</h4>
                <p className="text-slate-400 text-xs mt-0.5 max-w-sm">
                  Get notified about new PayPal integrations, AI copilot features, and developer tools.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 md:w-64 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 placeholder-slate-600 transition-all"
              />
              <button className="shrink-0 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main 4-Column Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Col 1 – Brand Block */}
          <div className="lg:col-span-2 space-y-5">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-all">
                <span className="text-white font-black text-xl select-none">P</span>
              </div>
              <div>
                <span className="text-white font-black text-lg tracking-tight flex items-center">
                  PayPilot
                  <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent ml-1 font-extrabold">
                    AI
                  </span>
                </span>
                <span className="text-[9px] text-slate-600 font-semibold tracking-widest uppercase block -mt-0.5">
                  Enterprise Commerce Engine
                </span>
              </div>
            </Link>

            {/* Description */}
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
              Enterprise commerce platform with intelligent shopping assistant, verified pricing, real-time inventory synchronization, and multi-channel payment solutions.
            </p>

            {/* Verified badge */}
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-400/8 border border-emerald-400/20 rounded-full px-3 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Verified Merchant · Instant Capture</span>
            </div>

            {/* Security badges pills */}
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> Platform Security
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SECURITY_BADGES.map((badge) => (
                  <span
                    key={badge}
                    className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg font-medium"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {SOCIAL_LINKS.map(({ href, icon: Icon, label, hover }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-500 transition-all duration-200 ${hover}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Cols 2-4 – Link Columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="space-y-4">
              <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href} label={link.label} external={"external" in link ? link.external : false} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Security & Trust Strip ── */}
      <div className="border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] tracking-widest uppercase text-slate-600 font-bold flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-cyan-400" />
              Verified Architecture
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2">
              {TRUST_PILLARS.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
                >
                  <span className="text-sm leading-none">{s.emoji}</span>
                  <span className="text-xs font-bold text-slate-300">{s.label}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-bold">
                    {s.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            © 2026 PayPilot AI Inc. &nbsp;·&nbsp; All rights reserved. &nbsp;·&nbsp; Authorized Enterprise Commerce
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-600">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Source Code</span>
            </a>
            <span>·</span>
            <a
              href="https://devpost.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>DevPost</span>
            </a>
            <span>·</span>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* ── Hackathon Badge & Tech Stack ── */}
      <div className="border-t border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Built for <span className="text-brand-400">PayPal AI Hackathon 2026</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-600 text-center">
            Made with ❤️ using Next.js · Express · Prisma · TypeScript · PayPal REST SDK v2 · Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
