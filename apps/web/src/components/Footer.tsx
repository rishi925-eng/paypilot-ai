import React from "react";
import Link from "next/link";
import { ShieldCheck, Code2, Heart, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
                P
              </div>
              <span className="font-bold text-white text-lg">PayPilot AI</span>
            </div>
            <p className="text-slate-400 max-w-sm text-xs leading-relaxed">
              Open-source commerce engine featuring LangGraph AI orchestration, zero-trust server pricing, and verified PayPal Sandbox order lifecycle management.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>PayPal Sandbox Verified • MIT Licensed</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Components
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Storefront Catalogue
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Cart & Tax Breakdown
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  PayPal Sandbox Checkout
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Merchant Analytics Hub
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Open Technology
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Next.js 14 & React 18</li>
              <li>Express & Node.js</li>
              <li>Prisma & PostgreSQL/SQLite</li>
              <li>LangGraph.js & Ollama</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PayPilot AI. Built for the Developer Community.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 mx-1" /> and PayPal Payments.
          </p>
        </div>
      </div>
    </footer>
  );
}
