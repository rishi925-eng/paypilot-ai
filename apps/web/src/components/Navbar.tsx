"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  LayoutDashboard,
  Sparkles,
  Globe,
  ChevronDown,
  Flame,
  Heart,
  Menu,
  X,
  Headphones,
  MonitorSmartphone,
  Laptop,
  Keyboard,
  Plane,
  Camera,
  Home as SmartHome,
  Puzzle,
  ShieldCheck,
  Code2,
  Package,
  User,
  LogOut,
  UserCheck,
} from "lucide-react";
import AIAssistantModal from "./AIAssistantModal";
import JudgeDemoBar from "./JudgeDemoBar";
import { fetchApi } from "../lib/api";
import { useCurrency, CurrencyType } from "../lib/currency";
import { useWishlist } from "../lib/wishlist";
import { useAuth } from "../lib/auth";

const CATALOGUE_CATEGORIES = [
  { label: "Audio", icon: Headphones, href: "/products?category=audio" },
  { label: "Accessories", icon: Puzzle, href: "/products?category=accessories" },
  { label: "Monitors", icon: MonitorSmartphone, href: "/products?category=monitors" },
  { label: "Laptops", icon: Laptop, href: "/products?category=laptops" },
  { label: "Keyboards", icon: Keyboard, href: "/products?category=keyboards" },
  { label: "Travel", icon: Plane, href: "/products?category=travel" },
  { label: "Cameras", icon: Camera, href: "/products?category=cameras" },
  { label: "Smart Home", icon: SmartHome, href: "/products?category=smarthome" },
];

export default function Navbar() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState<string | undefined>(undefined);
  const [cartCount, setCartCount] = useState(0);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const { user, openAuthModal, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { items: wishlistItems } = useWishlist();

  const catalogueRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // ── Scroll awareness ─────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Cart polling ──────────────────────────────────────────────────────────
  const refreshCart = async () => {
    try {
      const res = await fetchApi("/api/cart");
      if (res?.data?.summary) {
        setCartCount(res.data.summary.itemCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshCart();
    const interval = setInterval(refreshCart, 3000);
    return () => clearInterval(interval);
  }, []);

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catalogueRef.current && !catalogueRef.current.contains(e.target as Node)) {
        setCatalogueOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currencies: CurrencyType[] = ["USD", "INR", "EUR", "GBP"];

  const currencySymbol = (c: CurrencyType) =>
    c === "USD" ? "$" : c === "INR" ? "₹" : c === "EUR" ? "€" : "£";

  return (
    <>
      {/* ── Announcement Bar ────────────────────────────────────────────── */}
      {announcementVisible && (
        <div className="relative z-50 announcement-bar text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center text-center print:hidden no-print">
          <span className="tracking-wide">
            ✨ Free Express Delivery on orders over $100&nbsp;|&nbsp;Instant Secure Checkout&nbsp;|&nbsp;30-Day Money-Back Guarantee
          </span>
          <button
            onClick={() => setAnnouncementVisible(false)}
            aria-label="Close announcement"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Main Header (Spacious, Uncluttered, Premium) ──────────────────── */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300 print:hidden no-print ${
          scrolled
            ? "bg-slate-950/98 border-slate-800/80 shadow-xl shadow-black/30"
            : "bg-slate-950/95 border-slate-800/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">

          {/* ── Left: Brand Identity ──────────────────────────────────────── */}
          <Link href="/" className="flex items-center space-x-3.5 group shrink-0 py-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-all">
                P
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-white tracking-tight flex items-center leading-none">
                PayPilot
                <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent ml-1 font-extrabold text-lg">
                  AI
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                Enterprise Commerce
              </span>
            </div>
          </Link>

          {/* ── Center: Clean Navigation (Spacious, No Congestion) ─────────── */}
          <nav className="hidden lg:flex items-center space-x-1.5 text-sm font-semibold text-slate-300">
            {/* Products / Catalogue with dropdown */}
            <div ref={catalogueRef} className="relative">
              <button
                onMouseEnter={() => setCatalogueOpen(true)}
                onMouseLeave={() => setCatalogueOpen(false)}
                onClick={() => setCatalogueOpen((v) => !v)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
              >
                <span>Catalogue</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    catalogueOpen ? "rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>

              {/* Catalogue Dropdown Menu */}
              {catalogueOpen && (
                <div
                  onMouseEnter={() => setCatalogueOpen(true)}
                  onMouseLeave={() => setCatalogueOpen(false)}
                  className="absolute top-full left-0 mt-1.5 w-72 bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl shadow-black/70 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-2 pt-1 pb-2">
                    Browse Categories
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {CATALOGUE_CATEGORIES.map(({ label, icon: Icon, href }) => (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => setCatalogueOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-all group"
                      >
                        <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
                        <span className="text-xs font-semibold">{label}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <Link
                      href="/products"
                      onClick={() => setCatalogueOpen(false)}
                      className="flex items-center justify-center text-xs text-brand-400 hover:text-brand-300 font-bold py-1.5 transition-colors"
                    >
                      View All 30 Products →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Flash Deals */}
            <Link
              href="/deals"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer group"
            >
              <span>Deals</span>
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-tight shadow-sm shadow-orange-500/30">
                HOT
              </span>
            </Link>

            {/* Operations Hub (Dashboard) */}
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
            >
              <span>Operations Hub</span>
            </Link>

            {/* Resources & Docs Dropdown */}
            <div ref={resourcesRef} className="relative">
              <button
                onMouseEnter={() => setResourcesOpen(true)}
                onMouseLeave={() => setResourcesOpen(false)}
                onClick={() => setResourcesOpen((v) => !v)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
              >
                <span>Resources</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    resourcesOpen ? "rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>

              {resourcesOpen && (
                <div
                  onMouseEnter={() => setResourcesOpen(true)}
                  onMouseLeave={() => setResourcesOpen(false)}
                  className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl shadow-black/70 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <Link
                    href="/about"
                    onClick={() => setResourcesOpen(false)}
                    className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-400">Architecture</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Security & infrastructure</div>
                    </div>
                  </Link>

                  <Link
                    href="/api-docs"
                    onClick={() => setResourcesOpen(false)}
                    className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-slate-800 text-slate-200 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-400">API Documentation</div>
                      <div className="text-[11px] text-slate-400 leading-tight">Endpoints & OpenAPI 3.1</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* ── Right: Balanced Action Controls ───────────────────────────── */}
          <div className="flex items-center space-x-2.5 shrink-0">

            {/* Currency Selector */}
            <div ref={currencyRef} className="relative hidden sm:block">
              <button
                onClick={() => setCurrencyOpen((v) => !v)}
                className="flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {currencyOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setCurrencyOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-brand-600/30 transition-colors cursor-pointer ${
                        currency === c ? "text-cyan-400 bg-brand-950/60" : "text-slate-300"
                      }`}
                    >
                      <span>{c}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{currencySymbol(c)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-pink-400 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hidden sm:flex items-center justify-center group"
            >
              <Heart className="w-4 h-4 group-hover:fill-pink-400 transition-all" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow">
                  {wishlistItems.length > 99 ? "99+" : wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-brand-500 to-cyan-500 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth Menu */}
            {user ? (
              <div ref={userDropdownRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen((v) => !v)}
                  className="flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold border border-cyan-500/30 hover:border-cyan-500/60 transition-all cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-cyan-500 to-brand-600 text-white flex items-center justify-center text-[10px] font-black uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      user.role === "MERCHANT"
                        ? "bg-amber-950 text-amber-400 border border-amber-500/40"
                        : "bg-cyan-950 text-cyan-400"
                    }`}
                  >
                    {user.role === "MERCHANT" ? "Admin" : "User"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                    >
                      <Package className="w-4 h-4 text-cyan-400" />
                      <span>My Orders</span>
                    </Link>

                    {user.role === "MERCHANT" && (
                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-400" />
                        <span>Operations Hub</span>
                      </Link>
                    )}

                    <Link
                      href="/wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                    >
                      <Heart className="w-4 h-4 text-pink-400" />
                      <span>Wishlist ({wishlistItems.length})</span>
                    </Link>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-xl text-xs font-bold border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* AI Copilot Button */}
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ml-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>AI Copilot</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle mobile menu"
              className="lg:hidden p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ───────────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">

              {/* Catalogue Dropdown for Mobile */}
              <div>
                <button
                  onClick={() => setMobileCatOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold">Catalogue</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      mobileCatOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {mobileCatOpen && (
                  <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                    {CATALOGUE_CATEGORIES.map(({ label, icon: Icon, href }) => (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => {
                          setMobileOpen(false);
                          setMobileCatOpen(false);
                        }}
                        className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-cyan-400 transition-all"
                      >
                        <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-xs font-semibold">{label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* User Section (Mobile) */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-brand-600 text-white flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{user.name}</p>
                          <p className="text-[10px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                        {user.role}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-900 grid grid-cols-2 gap-2">
                      <Link
                        href="/orders"
                        onClick={() => setMobileOpen(false)}
                        className="py-1.5 px-3 bg-slate-900 text-center rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          logout();
                        }}
                        className="py-1.5 px-3 bg-rose-950/40 border border-rose-500/30 text-center rounded-xl text-xs font-semibold text-rose-400"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-cyan-600 rounded-xl font-bold text-xs text-white flex items-center justify-center space-x-2 shadow-md"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Sign In to Account</span>
                    </Link>
                    <div className="text-center text-[11px] text-slate-400">
                      New here?{" "}
                      <Link
                        href="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="text-cyan-400 font-bold hover:underline"
                      >
                        Create free account →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Deals */}
              <Link
                href="/deals"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-orange-400 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold">Deals</span>
                </div>
                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  HOT
                </span>
              </Link>

              {/* Operations Hub */}
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold">Operations Hub</span>
              </Link>

              {/* Architecture / About */}
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-cyan-400 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold">Architecture & Security</span>
              </Link>

              {/* API Docs */}
              <Link
                href="/api-docs"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-cyan-400 transition-all"
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold">API Documentation</span>
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-pink-400 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Heart className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold">Wishlist</span>
                </div>
                {wishlistItems.length > 0 && (
                  <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {wishlistItems.length > 99 ? "99+" : wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Currency (mobile) */}
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-4 pb-2">Currency</p>
                <div className="grid grid-cols-4 gap-1.5 px-2">
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setMobileOpen(false);
                      }}
                      className={`flex flex-col items-center py-2 rounded-xl text-xs font-bold transition-all ${
                        currency === c
                          ? "bg-brand-600/30 text-cyan-400 border border-brand-500/40"
                          : "text-slate-400 hover:bg-slate-900"
                      }`}
                    >
                      <span className="text-sm">{currencySymbol(c)}</span>
                      <span className="text-[10px]">{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Judge 1-Click Interactive Demo Tour Bar ──────────────────────── */}
      <JudgeDemoBar
        onOpenAI={(query) => {
          setAiInitialQuery(query);
          setIsAIModalOpen(true);
        }}
      />

      {/* ── AI Assistant Modal ───────────────────────────────────────────── */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => {
          setIsAIModalOpen(false);
          setAiInitialQuery(undefined);
        }}
        initialQuery={aiInitialQuery}
      />
    </>
  );
}
