"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Tag,
  Globe,
  Zap,
  Package,
  CheckCircle2,
  Heart,
  X,
  Gift,
  Truck,
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useCurrency } from "../../lib/currency";
import { useToast } from "../../lib/toast";

export default function CartPage() {
  const { formatPrice, currency } = useCurrency();
  const { toast } = useToast();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [xoomCurrency, setXoomCurrency] = useState<"EUR" | "GBP" | "INR">("EUR");

  const XOOM_RATES = { EUR: 0.92, GBP: 0.78, INR: 84.0 };
  const XOOM_SYMBOLS = { EUR: "€", GBP: "£", INR: "₹" };
  const HONEY_COUPONS: Record<string, number> = {
    HONEY20: 0.2,
    PAYPALAI: 0.15,
    SAVE10: 0.1,
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/api/cart");
      if (res?.data) setCart(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    const savedCoupon = localStorage.getItem("paypilot_applied_coupon");
    if (savedCoupon && HONEY_COUPONS[savedCoupon]) {
      setAppliedCoupon(savedCoupon);
      setCouponDiscount(HONEY_COUPONS[savedCoupon]);
    }
  }, []);

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    if (newQty < 1) { handleRemoveItem(itemId); return; }
    try {
      await fetchApi(`/api/cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity: newQty }),
      });
      loadCart();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await fetchApi(`/api/cart/items/${itemId}`, { method: "DELETE" });
      toast("Item removed from cart", "info");
      loadCart();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handleApplyCoupon = async () => {
    const upper = couponCode.toUpperCase().trim();
    if (!upper) { toast("Enter a coupon code", "error"); return; }
    setApplyingCoupon(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate API check
    if (HONEY_COUPONS[upper]) {
      setAppliedCoupon(upper);
      setCouponDiscount(HONEY_COUPONS[upper]);
      localStorage.setItem("paypilot_applied_coupon", upper);
      toast(`🍯 Coupon ${upper} applied! ${Math.round(HONEY_COUPONS[upper] * 100)}% off`, "success");
    } else {
      toast("Invalid coupon code. Try HONEY20, PAYPALAI, or SAVE10", "error");
    }
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    localStorage.removeItem("paypilot_applied_coupon");
    toast("Coupon removed", "info");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
        <p className="text-xs font-semibold text-slate-400">Loading your shopping cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const summary = cart?.summary || { subtotal: 0, tax: 0, shipping: 0, total: 0 };
  const discountAmount = summary.subtotal * couponDiscount;
  const finalTotal = summary.total - discountAmount;
  const xoomTotal = finalTotal * XOOM_RATES[xoomCurrency];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <ShoppingCart className="w-7 h-7 text-cyan-400" />
            <span>Shopping Cart</span>
            {items.length > 0 && (
              <span className="bg-gradient-to-r from-brand-600 to-cyan-600 text-white text-sm font-black px-3 py-1 rounded-full shadow-lg">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Server-authoritative pricing and real-time stock validation before PayPal checkout.
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs sm:text-sm text-cyan-400 font-bold flex items-center hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-slate-900/80 rounded-3xl p-16 text-center border border-slate-800 shadow-xl space-y-6 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center mx-auto">
            <ShoppingCart className="w-10 h-10 text-slate-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-2xl text-white">Your cart is empty</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2">
              Explore our curated catalogue of high-performance tech, audio gear, and developer essentials.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              <span>Browse Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/deals" className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm px-6 py-3 rounded-xl transition-all">
              <Zap className="w-4 h-4" />
              <span>Flash Deals</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Honey Coupon Bar */}
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xl">🍯</span>
                <span className="text-amber-300 font-extrabold text-sm">PayPal Honey</span>
              </div>
              {appliedCoupon ? (
                <div className="flex items-center space-x-2 flex-1">
                  <span className="bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono font-black px-3 py-1 rounded-lg text-sm">
                    {appliedCoupon}
                  </span>
                  <span className="text-emerald-400 font-bold text-sm">-{Math.round(couponDiscount * 100)}% applied!</span>
                  <span className="text-emerald-400 font-bold text-sm">Save {formatPrice(discountAmount)}</span>
                  <button onClick={handleRemoveCoupon} className="ml-auto text-slate-400 hover:text-rose-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Enter code: HONEY20, PAYPALAI..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-600"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5"
                  >
                    {applyingCoupon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
                    <span>Apply</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cart Items */}
            {items.map((item: any) => (
              <div
                key={item.id}
                className="group bg-slate-900/80 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 shadow-md transition-all flex flex-col sm:flex-row items-center gap-5"
              >
                <div className="relative shrink-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-24 h-24 rounded-xl object-cover bg-slate-950 border border-slate-800"
                  />
                  <span className="absolute -top-2 -left-2 bg-gradient-to-r from-brand-600 to-cyan-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg">
                    {item.product.category}
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <h3 className="font-extrabold text-white text-sm leading-snug">{item.product.name}</h3>
                  <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-slate-400">
                    {item.product.stock <= 5 && (
                      <span className="text-rose-400 font-bold">Only {item.product.stock} left!</span>
                    )}
                    {item.product.stock > 5 && (
                      <span className="text-emerald-400 font-semibold flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" />In Stock</span>
                    )}
                  </div>
                  <div className="text-slate-300 font-bold text-sm mt-1">
                    {formatPrice(item.unitPrice)}{" "}
                    <span className="text-slate-500 font-normal text-xs">each</span>
                  </div>
                  {appliedCoupon && (
                    <div className="text-amber-400 font-bold text-xs flex items-center">
                      🍯 {appliedCoupon}: -{Math.round(couponDiscount * 100)}% with Honey
                    </div>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                  <button
                    onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-900/60 flex items-center justify-center text-slate-300 hover:text-rose-300 text-sm font-bold transition-all"
                  >
                    −
                  </button>
                  <span className="w-9 text-center text-sm font-black text-white">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-900/60 flex items-center justify-center text-slate-300 hover:text-emerald-300 text-sm font-bold transition-all"
                  >
                    +
                  </button>
                </div>

                {/* Line Total & Remove */}
                <div className="text-right space-y-1.5">
                  <div className="text-lg font-black text-cyan-300">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                  {appliedCoupon && (
                    <div className="text-emerald-400 font-bold text-xs line-through text-slate-500">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center justify-end transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Xoom FX Widget */}
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-indigo-300 flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-indigo-400" /> PayPal Xoom FX — International Price
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold border border-indigo-500/30">
                  120min Lock
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {(["EUR", "GBP", "INR"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setXoomCurrency(c)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${xoomCurrency === c ? "bg-indigo-600 text-white shadow" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  {formatPrice(finalTotal)} USD → <strong className="text-indigo-300">{XOOM_SYMBOLS[xoomCurrency]}{xoomTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} {xoomCurrency}</strong>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Free Transfer</span>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-5">
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5 sticky top-24">
              <h3 className="font-extrabold text-white text-base border-b border-slate-800 pb-3.5 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-[10px] text-slate-500 font-mono font-normal bg-slate-800 px-2 py-0.5 rounded-md">Server-Authoritative</span>
              </h3>

              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-bold text-white">{formatPrice(summary.subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-amber-400">
                    <span className="flex items-center"><span className="mr-1">🍯</span> Honey Discount</span>
                    <span className="font-bold">−{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-bold text-white">{formatPrice(summary.tax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center"><Truck className="w-3.5 h-3.5 mr-1.5" />Shipping</span>
                  <span className="font-bold text-emerald-400">
                    {summary.shipping === 0 ? "FREE" : formatPrice(summary.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-3 border-t border-slate-800">
                  <span>Total Due</span>
                  <span className="text-cyan-400">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Paidy BNPL Banner */}
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl text-[11px] text-cyan-200">
                <div className="flex items-center justify-between">
                  <span className="flex items-center font-bold">
                    <Zap className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                    Pay in 4 installments
                  </span>
                  <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-extrabold border border-cyan-500/30 text-[10px]">0% APR</span>
                </div>
                <div className="text-xs mt-1 text-cyan-300 font-black">{formatPrice(finalTotal / 4)} / payment</div>
              </div>

              {/* Payment Methods Preview */}
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Accepted Methods</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-[#ffc439]/10 border border-[#ffc439]/30 rounded-xl text-center">
                    <div className="text-[10px] font-extrabold text-[#ffc439] italic">PayPal</div>
                  </div>
                  <div className="p-2 bg-[#008CFF]/10 border border-[#008CFF]/30 rounded-xl text-center">
                    <div className="text-[10px] font-extrabold text-[#008CFF] italic">venmo</div>
                  </div>
                  <div className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-center">
                    <div className="text-[10px] font-extrabold text-slate-300">Braintree</div>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-black text-sm py-3.5 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Proceed to PayPal Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Secured by PayPal Simility AI Fraud Guard</span>
              </div>
            </div>

            {/* Free Gift Banner */}
            <div className="bg-gradient-to-r from-rose-950/40 to-pink-950/40 border border-rose-500/30 rounded-2xl p-4 text-xs">
              <div className="flex items-center space-x-2 text-rose-300">
                <Gift className="w-4 h-4" />
                <span className="font-bold">Free gift wrapping on orders over $200!</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
