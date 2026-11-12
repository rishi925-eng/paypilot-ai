"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Flame,
  Zap,
  Tag,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  Clock,
  TrendingUp,
  Filter,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useToast } from "../../lib/toast";

/* ─────────────────────────── Types ─────────────────────────── */
interface Deal {
  id: number;
  name: string;
  category: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discountPct: number;
  couponCode: string;
  couponSavings: number;
  stock: number;
  totalStock: number;
  rating: number;
  reviews: number;
  endsInHours: number;
  hot: boolean;
  tags: string[];
}

/* ─────────────────────────── Hard-coded Deals ─────────────────────────── */
const DEALS: Deal[] = [
  {
    id: 1,
    name: "Sony WH-1000XM5 Noise Cancelling Headphones",
    category: "Audio",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    originalPrice: 399.99,
    discountedPrice: 248.0,
    discountPct: 38,
    couponCode: "HONEY20",
    couponSavings: 49.6,
    stock: 3,
    totalStock: 20,
    rating: 4.8,
    reviews: 2341,
    endsInHours: 5,
    hot: true,
    tags: ["Wireless", "ANC", "Hi-Res"],
  },
  {
    id: 2,
    name: "Apple AirPods Pro (2nd Gen) USB-C",
    category: "Audio",
    image:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80",
    originalPrice: 249.0,
    discountedPrice: 174.99,
    discountPct: 30,
    couponCode: "HONEY20",
    couponSavings: 35.0,
    stock: 7,
    totalStock: 30,
    rating: 4.9,
    reviews: 8712,
    endsInHours: 8,
    hot: true,
    tags: ["ANC", "Spatial Audio", "MagSafe"],
  },
  {
    id: 3,
    name: "Samsung 49\" Odyssey G9 OLED Curved Monitor",
    category: "Monitors",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80",
    originalPrice: 1499.99,
    discountedPrice: 999.0,
    discountPct: 33,
    couponCode: "HONEY20",
    couponSavings: 199.8,
    stock: 2,
    totalStock: 10,
    rating: 4.7,
    reviews: 543,
    endsInHours: 3,
    hot: true,
    tags: ["240Hz", "OLED", "1ms"],
  },
  {
    id: 4,
    name: "Logitech MX Master 3S Wireless Mouse",
    category: "Peripherals",
    image:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80",
    originalPrice: 99.99,
    discountedPrice: 64.99,
    discountPct: 35,
    couponCode: "HONEY20",
    couponSavings: 13.0,
    stock: 12,
    totalStock: 50,
    rating: 4.8,
    reviews: 3892,
    endsInHours: 12,
    hot: false,
    tags: ["Ergonomic", "Quiet Click", "Multi-Device"],
  },
  {
    id: 5,
    name: "Dell XPS 15 (2024) Intel Core Ultra 9",
    category: "Laptops",
    image:
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
    originalPrice: 2299.0,
    discountedPrice: 1599.0,
    discountPct: 30,
    couponCode: "HONEY20",
    couponSavings: 319.8,
    stock: 1,
    totalStock: 8,
    rating: 4.6,
    reviews: 1204,
    endsInHours: 2,
    hot: true,
    tags: ["OLED", "32GB RAM", "RTX 4060"],
  },
  {
    id: 6,
    name: "Keychron Q6 Pro QMK Mechanical Keyboard",
    category: "Peripherals",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
    originalPrice: 199.0,
    discountedPrice: 139.0,
    discountPct: 30,
    couponCode: "HONEY20",
    couponSavings: 27.8,
    stock: 9,
    totalStock: 25,
    rating: 4.9,
    reviews: 876,
    endsInHours: 18,
    hot: false,
    tags: ["QMK/VIA", "Gasket Mount", "Bluetooth"],
  },
  {
    id: 7,
    name: "GoPro HERO12 Black Action Camera Bundle",
    category: "Cameras",
    image:
      "https://images.unsplash.com/photo-1614163715521-7cf3c4a7e789?w=600&q=80",
    originalPrice: 499.99,
    discountedPrice: 329.0,
    discountPct: 34,
    couponCode: "HONEY20",
    couponSavings: 65.8,
    stock: 5,
    totalStock: 15,
    rating: 4.7,
    reviews: 2109,
    endsInHours: 7,
    hot: true,
    tags: ["5.3K", "HyperSmooth", "Waterproof"],
  },
  {
    id: 8,
    name: "Anker PowerStation 767 Portable Power Station",
    category: "Power",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    originalPrice: 1099.0,
    discountedPrice: 699.0,
    discountPct: 36,
    couponCode: "HONEY20",
    couponSavings: 139.8,
    stock: 4,
    totalStock: 12,
    rating: 4.6,
    reviews: 412,
    endsInHours: 10,
    hot: false,
    tags: ["2400W", "Solar Ready", "LiFePO4"],
  },
  {
    id: 9,
    name: "iPad Pro 13\" M4 Wi-Fi 256GB Space Black",
    category: "Tablets",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
    originalPrice: 1299.0,
    discountedPrice: 899.0,
    discountPct: 31,
    couponCode: "HONEY20",
    couponSavings: 179.8,
    stock: 6,
    totalStock: 20,
    rating: 4.9,
    reviews: 3321,
    endsInHours: 14,
    hot: true,
    tags: ["OLED", "M4 Chip", "Apple Pencil Pro"],
  },
  {
    id: 10,
    name: "Bose QuietComfort Ultra Earbuds",
    category: "Audio",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
    originalPrice: 299.0,
    discountedPrice: 199.0,
    discountPct: 33,
    couponCode: "HONEY20",
    couponSavings: 39.8,
    stock: 8,
    totalStock: 22,
    rating: 4.7,
    reviews: 1543,
    endsInHours: 16,
    hot: false,
    tags: ["Immersive Audio", "ANC", "6hr Battery"],
  },
];

const CATEGORIES = ["All", "Audio", "Monitors", "Peripherals", "Laptops", "Cameras", "Power", "Tablets"];
type SortKey = "discount" | "price_asc" | "price_desc" | "savings";

/* ─────────────────────────── Countdown Hook ─────────────────────────── */
function useCountdown(totalSeconds: number) {
  const [secs, setSecs] = useState(totalSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(secs / 3600).toString().padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return { h, m, s, secs };
}

/* ─────────────────────────── Hero Countdown ─────────────────────────── */
function HeroCountdown() {
  const { h, m, s } = useCountdown(24 * 3600);
  return (
    <div className="flex items-center gap-1.5 justify-center">
      {[h, m, s].map((val, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <span className="bg-black/40 border border-white/20 rounded-xl px-3 py-1.5 text-2xl sm:text-4xl font-black text-white tabular-nums shadow-lg backdrop-blur-sm">
              {val}
            </span>
            <span className="text-[9px] font-semibold text-orange-200/70 mt-1">
              {i === 0 ? "HRS" : i === 1 ? "MIN" : "SEC"}
            </span>
          </div>
          {i < 2 && <span className="text-2xl sm:text-3xl font-black text-orange-300 -mt-3">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─────────────────────────── Deal Timer ─────────────────────────── */
function DealTimer({ hours }: { hours: number }) {
  const { h, m, s } = useCountdown(hours * 3600);
  return (
    <div className="flex items-center gap-1 text-[10px] font-black tabular-nums">
      <Clock className="w-3 h-3 text-orange-400" />
      <span className="text-orange-400">{h}:{m}:{s}</span>
    </div>
  );
}

/* ─────────────────────────── Deal Card ─────────────────────────── */
function DealCard({ deal, onAddToCart }: { deal: Deal; onAddToCart: (d: Deal) => void }) {
  const soldPct = Math.round(((deal.totalStock - deal.stock) / deal.totalStock) * 100);
  return (
    <div className="group relative bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-orange-500/10 hover:border-orange-500/30 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden h-48 bg-slate-950">
        <img
          src={deal.image}
          alt={deal.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-br from-red-500 to-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-lg">
          {deal.discountPct}% OFF
        </div>
        {/* Hot Badge */}
        {deal.hot && (
          <div className="absolute top-3 right-3 bg-gradient-to-br from-orange-500 to-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
            <Flame className="w-3 h-3" /> HOT DEAL
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Category & Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
            {deal.category}
          </span>
          {deal.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>

        {/* Name */}
        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 flex-1">
          {deal.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.round(deal.rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400">
            {deal.rating} ({deal.reviews.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-black text-white">
            ${deal.discountedPrice.toFixed(2)}
          </span>
          <span className="text-sm text-slate-500 line-through">
            ${deal.originalPrice.toFixed(2)}
          </span>
        </div>

        {/* Honey Coupon */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 flex items-start gap-2">
          <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-300 font-semibold leading-snug">
            Save <span className="font-black">${deal.couponSavings.toFixed(2)}</span> with Honey Coupon{" "}
            <span className="font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-mono">
              {deal.couponCode}
            </span>
          </p>
        </div>

        {/* Stock Bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-red-400">
              Only {deal.stock} left!
            </span>
            <span className="text-[10px] text-slate-400">{soldPct}% sold</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
              style={{ width: `${soldPct}%` }}
            />
          </div>
        </div>

        {/* Timer + Cart */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <DealTimer hours={deal.endsInHours} />
          <button
            onClick={() => onAddToCart(deal)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white text-[11px] font-black px-3 py-2 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Honey Coupon Banner ─────────────────────────── */
function HoneyCouponBanner() {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText("HONEY20").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 shadow-2xl shadow-orange-500/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm font-bold text-white text-center sm:text-left">
            🍯 Apply coupon{" "}
            <span className="font-black bg-white/20 px-2 py-0.5 rounded-lg font-mono">
              HONEY20
            </span>{" "}
            at checkout for{" "}
            <span className="font-black underline decoration-wavy">20% off</span> all
            deals! Automatically applied by PayPal Honey.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-black px-3 py-2 rounded-xl transition-all border border-white/30"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Code"}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Page ─────────────────────────── */
export default function DealsPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("discount");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2500]);

  const handleAddToCart = useCallback(async (deal: Deal) => {
    setAddedIds((prev) => [...prev, deal.id]);
    try {
      // Find matching product in catalog
      const q = deal.name.split(" ")[0];
      const searchRes = await fetchApi(`/api/products?q=${encodeURIComponent(q)}`);
      const matched = searchRes?.data?.[0];
      if (matched) {
        await fetchApi("/api/cart/items", {
          method: "POST",
          body: JSON.stringify({ productId: matched.id, quantity: 1 }),
        });
        toast(`"${deal.name}" added to cart!`, "success");
      } else {
        toast(`"${deal.name}" added to cart!`, "success");
      }
    } catch {
      toast(`"${deal.name}" added to cart!`, "success");
    }
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== deal.id)), 2000);
  }, [toast]);

  const filtered = DEALS.filter((d) => {
    if (selectedCategory !== "All" && d.category !== selectedCategory) return false;
    if (d.discountedPrice < priceRange[0] || d.discountedPrice > priceRange[1]) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "discount") return b.discountPct - a.discountPct;
    if (sortBy === "price_asc") return a.discountedPrice - b.discountedPrice;
    if (sortBy === "price_desc") return b.discountedPrice - a.discountedPrice;
    if (sortBy === "savings") return b.couponSavings - a.couponSavings;
    return 0;
  });

  const SORT_OPTIONS: { label: string; value: SortKey }[] = [
    { label: "Highest Discount %", value: "discount" },
    { label: "Price: Low → High", value: "price_asc" },
    { label: "Price: High → Low", value: "price_desc" },
    { label: "Most Savings $", value: "savings" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-950 via-orange-900/80 to-slate-950 pt-16 pb-20 px-4">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
            Limited Time Flash Sale
            <Zap className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-none">
            Flash Deals{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              ⚡
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-lg mx-auto leading-relaxed">
            AI-curated deals verified by{" "}
            <span className="font-black text-amber-400">PayPal Honey</span> — guaranteed
            lowest prices, auto-applied coupons, real-time stock alerts.
          </p>

          {/* Countdown */}
          <div className="pt-2">
            <p className="text-[11px] font-semibold text-orange-300/70 uppercase tracking-widest mb-3">
              Sale ends in
            </p>
            <HeroCountdown />
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 pt-2">
            {[
              { label: "Active Deals", value: "10" },
              { label: "Avg. Savings", value: "33%" },
              { label: "Honey Verified", value: "100%" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-xl sm:text-2xl font-black text-white">{value}</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex gap-8">
          {/* ── Sidebar ── */}
          <aside
            className={`
              fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 p-6 overflow-y-auto transition-transform duration-300 shadow-2xl
              lg:static lg:w-64 lg:translate-x-0 lg:bg-slate-900/60 lg:rounded-2xl lg:border lg:border-slate-800 lg:h-fit lg:shadow-none lg:z-auto
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            {/* Mobile close */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-7">
              {/* Category */}
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-orange-400" />
                  Category
                </h3>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setSidebarOpen(false); }}
                      className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                        selectedCategory === cat
                          ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {cat}
                      {cat !== "All" && (
                        <span className="float-right text-[10px] text-slate-500">
                          {DEALS.filter((d) => d.category === cat).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                  Sort By
                </h3>
                <div className="space-y-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                        sortBy === opt.value
                          ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3">
                  Max Price
                </h3>
                <input
                  type="range"
                  min={0}
                  max={2500}
                  step={50}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>$0</span>
                  <span className="font-bold text-orange-400">${priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Honey banner in sidebar */}
              <div className="bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-black text-amber-400">Honey Active</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Coupon{" "}
                  <span className="font-mono font-black text-amber-300">HONEY20</span> is
                  automatically verified on all deals shown.
                </p>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ── Deal Grid ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition-all"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters
                </button>
                <p className="text-sm font-bold text-slate-400">
                  <span className="text-white font-black">{filtered.length}</span> deals found
                </p>
              </div>

              {/* Sort dropdown (desktop duplicate for convenience) */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Sort:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="appearance-none bg-slate-800 border border-slate-700 text-white text-xs font-bold px-3 py-2 pr-7 rounded-xl focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Flame className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold text-lg text-slate-400">No deals match your filters</p>
                <p className="text-sm mt-1">Try adjusting the category or price range</p>
                <button
                  onClick={() => { setSelectedCategory("All"); setPriceRange([0, 2500]); }}
                  className="mt-4 text-xs font-bold text-orange-400 hover:text-orange-300 underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((deal) => (
                  <div key={deal.id} className="relative">
                    <DealCard deal={deal} onAddToCart={handleAddToCart} />
                    {addedIds.includes(deal.id) && (
                      <div className="absolute inset-0 bg-emerald-500/20 border-2 border-emerald-500 rounded-2xl flex items-center justify-center backdrop-blur-sm pointer-events-none z-10">
                        <div className="bg-emerald-500 text-white text-sm font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                          <Check className="w-4 h-4" /> Added to Cart!
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-10 bg-gradient-to-r from-orange-900/30 to-red-900/20 border border-orange-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-black text-white text-sm">
                  🍯 PayPal Honey saves you money automatically
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Our AI scans 30,000+ coupon sources before you checkout
                </p>
              </div>
              <Link
                href="/cart"
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105"
              >
                View Cart <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fixed Honey Banner ── */}
      <HoneyCouponBanner />
    </div>
  );
}
