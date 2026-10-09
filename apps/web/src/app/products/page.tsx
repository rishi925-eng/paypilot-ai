"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Star,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { fetchApi } from "../../lib/api";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);

  const categories = ["All", "Audio", "Accessories", "Monitors", "Travel & Bags"];

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetchApi(
        `/api/products?category=${category !== "All" ? category : ""}&q=${search}`
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
  }, [category]);

  const handleAddToCart = async (productId: string) => {
    try {
      await fetchApi("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 2000);
    } catch (err: any) {
      alert("Could not add to cart: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Product Catalogue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Browse verified developer gear, studio monitors, accessories, and audio hardware.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === c
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadProducts()}
            placeholder="Search catalogue..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
          <p className="text-xs text-slate-500">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 bg-slate-100">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-md text-slate-700">
                    {p.category}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center space-x-1 text-amber-500 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{p.rating} ({p.reviewCount} reviews)</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>

                  {/* Attributes list */}
                  <div className="pt-2 space-y-1">
                    {p.attributes?.slice(0, 3).map((a: any, idx: number) => (
                      <div key={idx} className="text-[11px] text-slate-600 flex justify-between">
                        <span className="text-slate-400">{a.name}:</span>
                        <span className="font-medium">{a.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Price</span>
                  <span className="text-lg font-extrabold text-slate-900">${p.price.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => handleAddToCart(p.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    addedId === p.id
                      ? "bg-emerald-600 text-white"
                      : "bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
                  }`}
                >
                  {addedId === p.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Added</span>
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
          ))}
        </div>
      )}
    </div>
  );
}
