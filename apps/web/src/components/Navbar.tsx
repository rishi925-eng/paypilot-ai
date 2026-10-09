"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bot, ShoppingCart, LayoutDashboard, Sparkles, Shield, Package } from "lucide-react";
import AIAssistantModal from "./AIAssistantModal";
import { fetchApi } from "../lib/api";

export default function Navbar() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    try {
      const res = await fetchApi("/api/cart");
      if (res?.data?.summary) {
        setCartCount(res.data.summary.itemCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    refreshCart();
    const interval = setInterval(refreshCart, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center">
                PayPilot <span className="text-brand-600 ml-1 font-semibold">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
                Open Commerce Engine
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-brand-600 transition-colors">
              Storefront
            </Link>
            <Link href="/products" className="hover:text-brand-600 transition-colors">
              Products
            </Link>
            <Link href="/dashboard" className="flex items-center space-x-1 hover:text-brand-600 transition-colors">
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Merchant Hub</span>
            </Link>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 transition-all hover:shadow-lg active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Ask AI Copilot</span>
            </button>

            {/* Cart Icon Button */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Floating AI Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </>
  );
}
