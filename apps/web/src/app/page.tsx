"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  Star,
  Zap,
  Bot,
  ExternalLink,
} from "lucide-react";
import { fetchApi } from "../lib/api";
import AIAssistantModal from "../components/AIAssistantModal";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  attributes: Array<{ name: string; value: string }>;
}

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const categories = ["All", "Audio", "Accessories", "Monitors", "Travel & Bags"];

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetchApi(
        `/api/products?category=${selectedCategory !== "All" ? selectedCategory : ""}&q=${searchQuery}`
      );
      if (res?.data) {
        setProducts(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const handleAddToCart = async (productId: string) => {
    try {
      await fetchApi("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setAddedProductId(productId);
      setTimeout(() => setAddedProductId(null), 2000);
    } catch (err: any) {
      alert("Could not add to cart: " + err.message);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-slate-900 text-white pt-16 pb-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 bg-brand-500/20 border border-brand-400/30 px-3 py-1 rounded-full text-xs font-semibold text-brand-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Next-Gen Open Commerce with PayPal Sandbox</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              AI-Guided Shopping. <br />
              <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                Zero-Trust Payments.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Find premium developer hardware, compare audio specs, check budget limits, and checkout securely via PayPal with server-authoritative pricing.
            </p>

            {/* Quick AI Trigger Box */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-600 hover:to-indigo-600 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-xl shadow-brand-500/30 flex items-center justify-center space-x-2 transition-all hover:scale-105 active:scale-95 text-sm"
              >
                <Bot className="w-5 h-5 text-amber-300" />
                <span>Open AI Shopping Copilot</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-5 py-3.5 rounded-2xl transition-all text-sm flex items-center justify-center"
              >
                <span>View Merchant Dashboard</span>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
              <span className="flex items-center space-x-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>PayPal Capture Verification</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>LangGraph State Workflows</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Prisma Stock Reservation</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue & Filters Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6">
          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            {/* Categories */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadProducts()}
                placeholder="Search products..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="pt-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 rounded-2xl bg-slate-100 animate-pulse"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-slate-500 text-base">No products found matching criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                    loadProducts();
                  }}
                  className="text-xs text-brand-600 font-semibold hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative h-56 bg-slate-100 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 shadow-sm">
                          {product.category}
                        </div>
                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-lg text-[11px] font-semibold text-white flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{product.rating}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Specs attributes */}
                        {product.attributes && product.attributes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {product.attributes.slice(0, 2).map((attr, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                              >
                                {attr.name}: {attr.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer & Actions */}
                    <div className="p-5 pt-0">
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-xs text-slate-400 font-medium block">Price</span>
                          <span className="text-xl font-extrabold text-slate-900">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                              addedProductId === product.id
                                ? "bg-emerald-600 text-white"
                                : "bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white"
                            }`}
                          >
                            {addedProductId === product.id ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating AI Assistant Launcher */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}
