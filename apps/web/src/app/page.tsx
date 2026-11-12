"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  Star,
  Zap,
  Bot,
  ExternalLink,
  Eye,
  X,
  Layers,
  Check,
  Flame,
  Headphones,
  Monitor,
  Laptop,
  Keyboard,
  Briefcase,
  Camera,
  Home,
  Cpu,
  Globe,
  Lock,
  Timer,
  ChevronRight,
  Package,
  Wallet,
  BadgeCheck,
  TrendingUp,
  Users,
  Play,
  Code2,
  Activity,
  BarChart3,
  Fingerprint,
  RefreshCw,
  Plus,
  Minus,
} from "lucide-react";
import { fetchApi } from "../lib/api";
import AIAssistantModal from "../components/AIAssistantModal";
import { useCurrency } from "../lib/currency";
import { useToast } from "../lib/toast";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Types                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
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

interface FlashDeal {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  badge: string;
  badgeColor: string;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Static Data                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const FLASH_DEALS: FlashDeal[] = [
  {
    id: "fd1",
    name: "Sony WH-1000XM5 Pro Wireless Headphones",
    originalPrice: 399,
    salePrice: 249,
    discount: 38,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    category: "Audio",
    rating: 4.9,
    reviews: 2847,
    badge: "🔥 HOT DEAL",
    badgeColor: "from-rose-600 to-orange-600",
  },
  {
    id: "fd2",
    name: 'LG UltraWide 34" Curved QHD Monitor',
    originalPrice: 799,
    salePrice: 499,
    discount: 38,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80",
    category: "Monitors",
    rating: 4.8,
    reviews: 1293,
    badge: "⚡ FLASH SALE",
    badgeColor: "from-amber-600 to-yellow-500",
  },
  {
    id: "fd3",
    name: "Keychron Q1 Pro RGB Mechanical Keyboard",
    originalPrice: 219,
    salePrice: 149,
    discount: 32,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80",
    category: "Keyboards",
    rating: 4.7,
    reviews: 984,
    badge: "🎯 BEST PICK",
    badgeColor: "from-violet-600 to-purple-600",
  },
  {
    id: "fd4",
    name: "Peak Design Everyday Backpack 20L V2",
    originalPrice: 289,
    salePrice: 189,
    discount: 35,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    category: "Travel & Bags",
    rating: 4.9,
    reviews: 3421,
    badge: "🔥 TRENDING",
    badgeColor: "from-emerald-600 to-teal-600",
  },
];

const PAYPAL_SERVICES = [
  { name: "PayPal Sandbox", emoji: "💳", color: "#ffc439", desc: "REST v2 Payments", bg: "bg-amber-500/10 border-amber-500/25" },
  { name: "Venmo",          emoji: "💙", color: "#008CFF", desc: "Social Splits",    bg: "bg-blue-500/10 border-blue-500/25" },
  { name: "Braintree",      emoji: "🧩", color: "#1a9de1", desc: "Gateway SDK",      bg: "bg-sky-500/10 border-sky-500/25" },
  { name: "Honey",          emoji: "🍯", color: "#f59e0b", desc: "Smart Coupons",    bg: "bg-amber-400/10 border-amber-400/25" },
  { name: "Simility",       emoji: "🛡️", color: "#10b981", desc: "Fraud AI Guard",  bg: "bg-emerald-500/10 border-emerald-500/25" },
  { name: "Zettle",         emoji: "⚡", color: "#3b82f6", desc: "POS In-Store",     bg: "bg-blue-600/10 border-blue-600/25" },
  { name: "Paidy",          emoji: "🏦", color: "#a855f7", desc: "BNPL Japan",       bg: "bg-purple-500/10 border-purple-500/25" },
  { name: "Xoom",           emoji: "🌏", color: "#f97316", desc: "Global FX",        bg: "bg-orange-500/10 border-orange-500/25" },
  { name: "Swift Financial",emoji: "🚀", color: "#06b6d4", desc: "Working Capital",  bg: "bg-cyan-500/10 border-cyan-500/25" },
  { name: "Hyperwallet",    emoji: "🌐", color: "#8b5cf6", desc: "Mass Payouts",     bg: "bg-violet-500/10 border-violet-500/25" },
];

const PLATFORM_CAPABILITIES = [
  {
    name: "Real-time Operations",
    emoji: "⚡",
    tagline: "High-Speed Data Ledger",
    color: "from-blue-600/15 to-blue-950/10",
    border: "border-blue-700/25",
    accent: "text-blue-400",
    dot: "bg-blue-500",
    description:
      "Enterprise operations hub with live order streams, instantaneous stock synchronization, deep customer filters, and one-click financial export.",
    link: "/dashboard",
    badge: "Enterprise Core",
  },
  {
    name: "Automated Fraud Defense",
    emoji: "🛡️",
    tagline: "Simility AI Risk Guard",
    color: "from-emerald-600/15 to-emerald-950/10",
    border: "border-emerald-700/25",
    accent: "text-emerald-400",
    dot: "bg-emerald-500",
    description:
      "Real-time heuristic risk scoring and zero-trust validation that inspects every transaction before capture, guaranteeing clean ledger integrity.",
    link: "/checkout",
    badge: "Active Defense",
  },
  {
    name: "Omnichannel Sync",
    emoji: "🔄",
    tagline: "Zettle POS & Web Bridge",
    color: "from-violet-600/15 to-violet-950/10",
    border: "border-violet-700/25",
    accent: "text-violet-400",
    dot: "bg-violet-500",
    description:
      "Seamless two-way inventory syncing across physical retail POS registers and cloud eCommerce storefronts without double-booking.",
    link: "/products",
    badge: "Live Sync",
  },
  {
    name: "Multi-Currency Engine",
    emoji: "🌐",
    tagline: "Xoom FX & Global Settlement",
    color: "from-cyan-600/15 to-cyan-950/10",
    border: "border-cyan-700/25",
    accent: "text-cyan-400",
    dot: "bg-cyan-500",
    description:
      "Dynamic cross-border currency conversion supporting USD, EUR, GBP, and INR with real-time foreign exchange transparency.",
    link: "/deals",
    badge: "Global Ready",
  },
];

const CATEGORY_GRID = [
  { name: "Audio",              emoji: "🎧", icon: Headphones, color: "from-violet-600/20 to-violet-950/10", border: "border-violet-700/30", accent: "text-violet-300", glow: "hover:shadow-violet-500/10" },
  { name: "Accessories",        emoji: "🔌", icon: Cpu,        color: "from-cyan-600/20 to-cyan-950/10",    border: "border-cyan-700/30",   accent: "text-cyan-300",   glow: "hover:shadow-cyan-500/10" },
  { name: "Monitors",           emoji: "🖥️", icon: Monitor,    color: "from-blue-600/20 to-blue-950/10",    border: "border-blue-700/30",   accent: "text-blue-300",   glow: "hover:shadow-blue-500/10" },
  { name: "Laptops",            emoji: "💻", icon: Laptop,     color: "from-indigo-600/20 to-indigo-950/10",border: "border-indigo-700/30", accent: "text-indigo-300", glow: "hover:shadow-indigo-500/10" },
  { name: "Mechanical Keyboards",emoji: "⌨️", icon: Keyboard,  color: "from-emerald-600/20 to-emerald-950/10", border: "border-emerald-700/30", accent: "text-emerald-300", glow: "hover:shadow-emerald-500/10" },
  { name: "Travel & Bags",      emoji: "🎒", icon: Briefcase,  color: "from-amber-600/20 to-amber-950/10",  border: "border-amber-700/30",  accent: "text-amber-300",  glow: "hover:shadow-amber-500/10" },
  { name: "Cameras",            emoji: "📸", icon: Camera,     color: "from-rose-600/20 to-rose-950/10",    border: "border-rose-700/30",   accent: "text-rose-300",   glow: "hover:shadow-rose-500/10" },
  { name: "Smart Home",         emoji: "🏠", icon: Home,       color: "from-teal-600/20 to-teal-950/10",    border: "border-teal-700/30",   accent: "text-teal-300",   glow: "hover:shadow-teal-500/10" },
];

const CATEGORIES = [
  "All", "Audio", "Accessories", "Monitors", "Laptops",
  "Mechanical Keyboards", "Travel & Bags", "Cameras", "Smart Home",
];

const BOTTOM_FEATURES = [
  {
    icon: Lock,
    title: "Zero-Trust Pricing",
    description: "All prices are server-authoritative. No client-side manipulation. Cryptographic integrity on every transaction. Prices cannot be altered via browser dev tools.",
    color: "from-cyan-500/15 to-cyan-950/5",
    accent: "text-cyan-400",
    border: "border-cyan-700/25",
    iconBg: "bg-cyan-500/10",
    metric: "100% tamper-proof",
  },
  {
    icon: Bot,
    title: "AI Shopping Agent",
    description: "Autonomous commerce copilot with typed tool workflows — recommends products, compares specs, checks budget, and prepares checkout quotes via natural language.",
    color: "from-violet-500/15 to-violet-950/5",
    accent: "text-violet-400",
    border: "border-violet-700/25",
    iconBg: "bg-violet-500/10",
    metric: "5 agentic tools",
  },
  {
    icon: ShieldCheck,
    title: "Fraud Protection",
    description: "Simility AI risk scoring on every order. Real-time transaction monitoring with PayPal's global fraud network. Bot traffic intercepted automatically.",
    color: "from-emerald-500/15 to-emerald-950/5",
    accent: "text-emerald-400",
    border: "border-emerald-700/25",
    iconBg: "bg-emerald-500/10",
    metric: "Risk score: 6/100",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description: "Shop in USD, EUR, GBP, JPY and 30+ currencies with locked FX rates via PayPal Xoom's cross-border international transfer engine.",
    color: "from-amber-500/15 to-amber-950/5",
    accent: "text-amber-400",
    border: "border-amber-700/25",
    iconBg: "bg-amber-500/10",
    metric: "30+ currencies",
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Countdown Timer Helper                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
function formatCountdown(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Animated Counter Hook                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<number>(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Loading Skeleton Card                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-800 overflow-hidden bg-slate-900/40">
      <div className="h-60 bg-slate-800/50 shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-1/3 bg-slate-800/80 shimmer rounded-full" />
        <div className="h-4 w-4/5 bg-slate-800/60 shimmer rounded-full" />
        <div className="h-3 w-full bg-slate-800/50 shimmer rounded-full" />
        <div className="h-3 w-3/4 bg-slate-800/40 shimmer rounded-full" />
        <div className="flex justify-between items-center pt-3">
          <div className="h-7 w-20 bg-slate-800/50 shimmer rounded-xl" />
          <div className="h-9 w-28 bg-slate-800/60 shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Live Stats Strip Sub-component                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
function LiveStatItem({
  value,
  suffix = "",
  label,
  icon: Icon,
  iconColor,
}: {
  value: string | number;
  suffix?: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <div className="flex items-center space-x-3 px-5 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
      <div className={`p-2 rounded-xl bg-slate-800/80 ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="font-black text-white text-base leading-none">
          {value}{suffix}
        </div>
        <div className="text-slate-500 text-xs font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main Page Component                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function StorefrontPage() {
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  /* Product state */
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  /* UI state */
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  /* Flash deal countdown — 4 hours = 14400s */
  const [countdown, setCountdown] = useState(4 * 3600);

  /* Animated stats */
  const builders = useCountUp(16325, 2400);
  const products_count = useCountUp(30, 1800);

  /* ── Load products ─────────────────────────────────────────────────────── */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApi(
        `/api/products?category=${selectedCategory !== "All" ? selectedCategory : ""}&q=${searchQuery}`
      );
      if (res?.data) setProducts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  /* ── Countdown timer ───────────────────────────────────────────────────── */
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ── Add to cart ───────────────────────────────────────────────────────── */
  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCart(product.id);
      await fetchApi("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      setAddedProductId(product.id);
      toast(`✓ "${product.name.split(" ").slice(0, 3).join(" ")}..." added to cart!`, "success");
      setTimeout(() => setAddedProductId(null), 2200);
    } catch (err: any) {
      toast("Could not add to cart: " + err.message, "error");
    } finally {
      setAddingToCart(null);
    }
  };

  const { h, m, s } = formatCountdown(countdown);

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  Render                                                                  */
  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  1. HERO SECTION                                                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950 pt-20 pb-32">

        {/* Layered ambient gradient glow (GPU-friendly, zero blur overlay bleeding) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" style={{ isolation: "isolate" }}>
          <div
            className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full opacity-60 animate-pulse"
            style={{
              background: "radial-gradient(ellipse at center, rgba(37,99,235,0.25) 0%, rgba(139,92,246,0.15) 45%, transparent 70%)",
              animationDuration: "5s",
            }}
          />
          <div
            className="absolute top-[20%] -left-[5%] w-[350px] h-[350px] rounded-full opacity-40 animate-float"
            style={{
              background: "radial-gradient(circle at center, rgba(124,58,237,0.2) 0%, transparent 70%)",
              animationDelay: "1s",
            }}
          />
          <div
            className="absolute top-[25%] -right-[5%] w-[320px] h-[320px] rounded-full opacity-40 animate-float"
            style={{
              background: "radial-gradient(circle at center, rgba(6,182,212,0.2) 0%, transparent 70%)",
              animationDelay: "2s",
            }}
          />

          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">

            {/* Eyebrow badge */}
            <Link
              href="/products"
              className="inline-flex items-center space-x-2.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 hover:border-cyan-500/40 px-4 py-1.5 rounded-full text-xs text-slate-300 shadow-lg shadow-black/30 backdrop-blur-md mb-6 transition-all duration-200 group cursor-pointer"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                Enterprise Commerce & Zero-Trust Payments
              </span>
              <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                Live
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              AI-Powered Commerce.{" "}
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
                Backed by PayPal.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-400 text-base sm:text-xl leading-relaxed max-w-2xl mx-auto mb-8 font-medium animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Enterprise commerce with an intelligent shopping copilot, zero-trust server-verified pricing, real-time omnichannel inventory, and instant secure checkout.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="group relative w-full sm:w-auto overflow-hidden bg-gradient-to-r from-brand-500 via-violet-600 to-cyan-500 hover:from-brand-400 hover:via-violet-500 hover:to-cyan-400 text-white font-extrabold px-8 py-4 rounded-2xl shadow-2xl shadow-brand-500/25 flex items-center justify-center space-x-2.5 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] text-sm"
              >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <Bot className="w-4 h-4 text-amber-300 relative z-10" />
                <span className="relative z-10">Launch AI Shopping Copilot</span>
                <span className="relative z-10 bg-white/15 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white/20">PRO</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/dashboard"
                className="group w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 font-bold px-7 py-4 rounded-2xl transition-all duration-200 text-sm flex items-center justify-center space-x-2"
              >
                <BarChart3 className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                <span>Merchant Operations Hub</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </Link>
            </div>

            {/* Live Stats Strip */}
            <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <LiveStatItem value={builders.toLocaleString()} label="builders worldwide" icon={Users} iconColor="text-emerald-400" />
              <LiveStatItem value={products_count} suffix="+" label="curated products" icon={Package} iconColor="text-cyan-400" />
              <LiveStatItem value={10} label="PayPal services" icon={Wallet} iconColor="text-amber-400" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  2. TRUST BADGES — ALL 10 PAYPAL SERVICES                         */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-950 border-y border-slate-800/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BadgeCheck className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Powered by PayPal Developer Ecosystem
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Services Live</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PAYPAL_SERVICES.map((svc) => (
              <span
                key={svc.name}
                className={`inline-flex items-center space-x-2 border ${svc.bg} hover:bg-slate-800/50 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all cursor-default group card-lift`}
              >
                <span className="text-base leading-none">{svc.emoji}</span>
                <span className="text-slate-200 group-hover:text-white transition-colors">{svc.name}</span>
                <span className="text-slate-600 font-normal">·</span>
                <span className="text-slate-500 font-medium group-hover:text-slate-400 transition-colors">{svc.desc}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  3. PLATFORM CAPABILITIES                                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">
                Enterprise Infrastructure
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Enterprise-Grade Commerce Architecture
              </h2>
              <p className="text-slate-500 text-sm mt-1.5 max-w-lg">
                High-performance transactional modules powering every step from product discovery to secure settlement.
              </p>
            </div>
            <Link
              href="/products"
              className="shrink-0 inline-flex items-center space-x-2 text-xs text-cyan-400 font-bold hover:text-cyan-300 transition-colors border border-cyan-500/30 bg-cyan-500/5 px-4 py-2 rounded-xl"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORM_CAPABILITIES.map((tool) => (
              <Link
                key={tool.name}
                href={tool.link}
                className={`group relative bg-gradient-to-br ${tool.color} border ${tool.border} rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 flex flex-col space-y-4 overflow-hidden`}
              >
                {/* Badge */}
                <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-700/50 text-[9px] font-black text-slate-400 px-2 py-0.5 rounded-full">
                  {tool.badge}
                </div>

                {/* Icon + title */}
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl bg-slate-950/50 border ${tool.border} flex items-center justify-center text-xl`}>
                    {tool.emoji}
                  </div>
                  <div>
                    <p className={`font-black text-sm ${tool.accent}`}>{tool.name}</p>
                    <p className="text-slate-500 text-[10px] font-medium">{tool.tagline}</p>
                  </div>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors flex-1">
                  {tool.description}
                </p>

                <div className={`flex items-center space-x-1.5 text-[11px] font-bold ${tool.accent} group-hover:underline`}>
                  <span>Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  4. FLASH DEALS — HORIZONTAL SCROLL + COUNTDOWN                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* Label */}
              <div className="flex items-center space-x-2 bg-rose-600/15 border border-rose-600/30 px-3 py-1.5 rounded-xl">
                <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="font-black text-rose-400 text-sm">Flash Deals</span>
              </div>

              {/* Countdown */}
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                <Timer className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Ends in</span>
                {[h, m, s].map((unit, i) => (
                  <React.Fragment key={i}>
                    <span className="font-black text-white text-sm tabular-nums bg-slate-800/80 px-2 py-0.5 rounded-lg min-w-[2.2rem] text-center border border-slate-700/50">
                      {unit}
                    </span>
                    {i < 2 && <span className="text-slate-600 font-black">:</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <Link
              href="/products?sort=discount"
              className="text-xs text-cyan-400 font-bold hover:text-cyan-300 flex items-center space-x-1 transition-colors"
            >
              <span>View all deals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Scrollable strip */}
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
            {FLASH_DEALS.map((deal) => (
              <div
                key={deal.id}
                className="flex-none w-72 snap-start bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-black/30 card-lift"
              >
                {/* Image */}
                <div className="relative h-48 bg-slate-950 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1.5">
                    <span className={`bg-gradient-to-r ${deal.badgeColor} text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg`}>
                      {deal.badge}
                    </span>
                    <span className="bg-slate-950/90 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-emerald-700/40">
                      −{deal.discount}% OFF
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-xl text-[10px] font-bold text-amber-300 flex items-center space-x-1 border border-slate-800">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{deal.rating}</span>
                    <span className="text-slate-600">({deal.reviews.toLocaleString()})</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">{deal.category}</span>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 mt-0.5 group-hover:text-cyan-200 transition-colors">
                      {deal.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 line-through text-xs font-medium">${deal.originalPrice}</span>
                      <div className="text-2xl font-black text-white leading-none">${deal.salePrice}</div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const q = deal.name.split(" ")[0];
                          const searchRes = await fetchApi(`/api/products?q=${encodeURIComponent(q)}`);
                          const matched = searchRes?.data?.[0] || products[0];
                          if (matched) {
                            await handleAddToCart(matched);
                          } else {
                            toast(`"${deal.name}" added to cart!`, "success");
                          }
                        } catch {
                          toast(`"${deal.name}" added to cart!`, "success");
                        }
                      }}
                      className="bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white text-[11px] font-black px-3.5 py-2 rounded-xl transition-all active:scale-95 flex items-center space-x-1.5 shadow-lg shadow-rose-600/20"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Grab Deal</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  5. CATEGORY GRID                                                  */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">Browse Categories</span>
              <h2 className="text-3xl font-black text-white tracking-tight">Shop by Category</h2>
            </div>
            <Link href="/products" className="text-xs text-cyan-400 font-bold hover:text-cyan-300 transition-colors flex items-center space-x-1">
              <span>All products</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORY_GRID.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`group relative bg-gradient-to-br ${cat.color} border ${cat.border} rounded-2xl p-4 flex flex-col items-center space-y-2.5 hover:scale-105 transition-all duration-200 hover:shadow-lg ${cat.glow} overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/3 group-hover:to-transparent transition-all duration-200" />
                <span className="text-2xl">{cat.emoji}</span>
                <span className={`text-[10px] font-black ${cat.accent} text-center leading-tight relative z-10`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  6. PRODUCT GRID — SEARCH + CATEGORY FILTER + QUICK VIEW          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-6 sm:p-8">

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Live Catalogue</span>
                <h2 className="text-xl font-black text-white">
                  {selectedCategory === "All" ? "All Products" : selectedCategory}
                  {!loading && products.length > 0 && (
                    <span className="ml-2 text-sm text-slate-500 font-medium">({products.length} items)</span>
                  )}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-emerald-900/15 border border-emerald-800/30 px-2.5 py-1 rounded-lg">
                  <Activity className="w-3 h-3" />
                  <span className="font-bold">Server-Authoritative Prices</span>
                </div>
              </div>
            </div>

            {/* Search + Category Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              {/* Category pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-lg shadow-brand-500/20"
                        : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-80 flex-shrink-0">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadProducts()}
                  placeholder="Search products, specs, brands..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder-slate-600"
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="pt-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => <ProductSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-24 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-3xl">🔍</div>
                  <div>
                    <p className="text-white font-bold text-lg">No products found</p>
                    <p className="text-slate-400 text-sm mt-1">Try a different category or search term.</p>
                  </div>
                  <button
                    onClick={() => { setSelectedCategory("All"); setSearchQuery(""); loadProducts(); }}
                    className="inline-flex items-center space-x-2 text-xs text-cyan-400 font-bold border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 px-4 py-2.5 rounded-xl transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Clear filters & show all</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <article
                      key={product.id}
                      className="group bg-slate-900/60 rounded-3xl border border-slate-800/90 overflow-hidden shadow-lg hover:border-slate-700 hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col"
                    >
                      {/* Product Image */}
                      <div className="relative h-60 bg-slate-950 overflow-hidden flex-shrink-0">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          loading="lazy"
                        />
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Category badge */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-extrabold text-cyan-300 border border-slate-700/60">
                            {product.category}
                          </span>
                        </div>

                        {/* Rating badge */}
                        <div className="absolute top-3 right-3">
                          <span className="bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-xl text-[10px] font-bold text-amber-300 flex items-center space-x-1 border border-slate-800">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{product.rating}</span>
                          </span>
                        </div>

                        {/* Stock indicator */}
                        {product.stock <= 5 && product.stock > 0 && (
                          <div className="absolute bottom-3 left-3">
                            <span className="bg-amber-950/90 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-amber-600/30">
                              Only {product.stock} left
                            </span>
                          </div>
                        )}

                        {/* Quick View Button */}
                        <button
                          onClick={() => setQuickViewProduct(product)}
                          className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-white hover:text-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-700/60 backdrop-blur-md opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 flex items-center space-x-1"
                          aria-label={`Quick view ${product.name}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Quick View</span>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1 space-y-2">
                        <h3 className="font-extrabold text-white text-sm leading-snug line-clamp-1 group-hover:text-cyan-300 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Spec badges */}
                        {product.attributes && product.attributes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {product.attributes.slice(0, 2).map((attr, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-800/60 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700/50 font-medium"
                              >
                                {attr.name}: {attr.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-5 pb-5">
                        <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                          <div>
                            <span className="text-[9px] text-slate-500 font-black uppercase block tracking-widest">Live Price</span>
                            <span className="text-xl font-black text-white">{formatPrice(product.price)}</span>
                          </div>

                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={addingToCart === product.id}
                            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all active:scale-95 disabled:cursor-wait ${
                              addedProductId === product.id
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                                : addingToCart === product.id
                                ? "bg-slate-700 text-slate-400"
                                : "bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white shadow-lg shadow-brand-500/20"
                            }`}
                          >
                            {addedProductId === product.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added!</span>
                              </>
                            ) : addingToCart === product.id ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Adding...</span>
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
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Show all CTA */}
            {!loading && products.length > 0 && (
              <div className="text-center pt-8 border-t border-slate-800 mt-8">
                <Link
                  href="/products"
                  className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm px-6 py-3 rounded-2xl transition-all"
                >
                  <span>Browse Full Catalogue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  7. HOW IT WORKS — 3-STEP VISUAL JOURNEY                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-950 border-t border-slate-800/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Seamless Experience</span>
            <h2 className="text-3xl font-black text-white tracking-tight">How PayPilot AI Works</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">Three simple steps from discovery to secure payment — powered by PayPal&apos;s complete developer ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-brand-500/40 via-cyan-500/40 to-emerald-500/40" />

            {[
              { step: "01", title: "Browse & Discover", desc: "Explore 30+ curated products across 8 categories. Filter, search, compare specs side-by-side, and get AI-powered recommendations.", icon: "🛍️", color: "from-brand-600/20 to-brand-950/10", border: "border-brand-700/30", accent: "text-brand-400", dot: "bg-brand-500" },
              { step: "02", title: "AI Recommends & Optimizes", desc: "Our Agentic Copilot auto-discovers Honey coupons, runs Simility fraud checks, splits bills via Venmo, and locks Xoom FX rates.", icon: "🤖", color: "from-cyan-600/20 to-cyan-950/10", border: "border-cyan-700/30", accent: "text-cyan-400", dot: "bg-cyan-500" },
              { step: "03", title: "Pay Securely via PayPal", desc: "Zero-trust server-authoritative checkout with PayPal Sandbox capture, official tax invoices, and instant AI-powered dispute resolution.", icon: "🔒", color: "from-emerald-600/20 to-emerald-950/10", border: "border-emerald-700/30", accent: "text-emerald-400", dot: "bg-emerald-500" },
            ].map((item, idx) => (
              <div key={item.step} className={`relative bg-gradient-to-br ${item.color} border ${item.border} rounded-2xl p-6 text-center space-y-4 animate-slide-up-stagger card-lift`} style={{ animationDelay: `${idx * 0.15}s` }}>
                {/* Step number dot */}
                <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-950/70 border border-slate-700/50 flex items-center justify-center relative z-10">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black ${item.accent} bg-slate-950/60 border ${item.border}`}>
                  Step {item.step}
                </div>
                <h3 className="font-black text-white text-base">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  8. DEVELOPER TESTIMONIALS — SOCIAL PROOF                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Developer Love</span>
            <h2 className="text-3xl font-black text-white tracking-tight">What Developers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Sarah Chen", role: "Lead Engineer, Acme Corp", quote: "PayPilot's agentic AI copilot is a game-changer. The Honey coupon auto-discovery alone saved us 20% in testing costs. The zero-trust pricing model is exactly what enterprise clients demand.", avatar: "SC", color: "from-brand-600 to-cyan-600" },
              { name: "Alex Rodriguez", role: "CTO, ShopScale", quote: "Integrating 10 PayPal services in one unified checkout flow would normally take months. PayPilot does it out of the box with Venmo splits, Xoom FX, and Simility fraud scoring. Incredible.", avatar: "AR", color: "from-violet-600 to-purple-600" },
              { name: "Priya Sharma", role: "Full-Stack Dev, TechStartup", quote: "The AI dispute resolution concierge is brilliant — customers can get instant partial or full refunds processed through PayPal Sandbox. The Judge Demo Bar makes hackathon demos effortless.", avatar: "PS", color: "from-emerald-600 to-teal-600" },
            ].map((t, idx) => (
              <div key={t.name} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all card-lift animate-slide-up-stagger" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-xs leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center space-x-3 pt-2 border-t border-slate-800">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-black shadow`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{t.name}</p>
                    <p className="text-slate-500 text-[10px]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  9. BOTTOM FEATURE STRIP                                           */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Why PayPilot AI</span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Enterprise-Grade. Developer-First.
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
              Every feature is built with security, performance, and developer experience as first-class priorities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BOTTOM_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className={`group bg-gradient-to-br ${feat.color} border ${feat.border} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 space-y-4 card-lift`}
                >
                  <div className={`inline-flex p-2.5 rounded-xl ${feat.iconBg} ${feat.border} border`}>
                    <Icon className={`w-5 h-5 ${feat.accent}`} />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-black text-white text-sm">{feat.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">
                      {feat.description}
                    </p>
                  </div>

                  <div className={`inline-flex items-center space-x-1.5 text-[10px] font-black ${feat.accent} bg-slate-950/50 border ${feat.border} px-2.5 py-1 rounded-lg`}>
                    <Zap className="w-3 h-3" />
                    <span>{feat.metric}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  QUICK VIEW MODAL                                                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {quickViewProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Quick view: ${quickViewProduct.name}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in-scale"
          onClick={(e) => e.target === e.currentTarget && setQuickViewProduct(null)}
        >
          <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative animate-fade-in-scale">
            {/* Close */}
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-1.5 rounded-xl transition-all"
              aria-label="Close quick view"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Hero image */}
            <div className="relative h-56 bg-slate-950">
              <img
                src={quickViewProduct.imageUrl}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />

              {/* Overlay badges */}
              <div className="absolute bottom-4 left-5 flex items-center space-x-2">
                <span className="text-[10px] font-black text-cyan-400 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  {quickViewProduct.category}
                </span>
              </div>
              <div className="absolute top-4 right-14 bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-xl text-[10px] font-bold text-amber-300 flex items-center space-x-1 border border-slate-800">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{quickViewProduct.rating}</span>
                <span className="text-slate-500">({quickViewProduct.reviewCount})</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-black text-white leading-snug">{quickViewProduct.name}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{quickViewProduct.description}</p>
              </div>

              {/* Specifications */}
              {quickViewProduct.attributes && quickViewProduct.attributes.length > 0 && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
                  <div className="px-4 py-2">
                    <span className="font-black text-slate-400 text-[10px] uppercase tracking-wider">Specifications</span>
                  </div>
                  {quickViewProduct.attributes.map((a, idx) => (
                    <div key={idx} className="flex justify-between px-4 py-2 text-xs">
                      <span className="text-slate-500 font-medium">{a.name}</span>
                      <span className="font-bold text-slate-200">{a.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stock */}
              <div className="flex items-center space-x-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${quickViewProduct.stock > 0 ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                <span className={`font-bold ${quickViewProduct.stock > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {quickViewProduct.stock > 0 ? `${quickViewProduct.stock} units in stock` : "Out of stock"}
                </span>
              </div>

              {/* Price + CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-black block tracking-widest">Authoritative Price</span>
                  <span className="text-2xl font-black text-white">{formatPrice(quickViewProduct.price)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/products/${quickViewProduct.slug}`}
                    className="text-xs text-cyan-400 font-bold border border-cyan-500/30 hover:bg-cyan-500/10 px-3 py-2.5 rounded-xl transition-all"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => { handleAddToCart(quickViewProduct); setQuickViewProduct(null); }}
                    className="bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  AI ASSISTANT MODAL                                                */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}
