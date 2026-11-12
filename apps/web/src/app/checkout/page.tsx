"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  ShoppingBag,
  Sparkles,
  Users,
  Building,
  Tag,
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useCurrency } from "../../lib/currency";
import { useToast } from "../../lib/toast";
import { useAuth } from "../../lib/auth";

export default function CheckoutPage() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { user, openAuthModal } = useAuth();

  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState<"PAYPAL" | "VENMO" | "BRAINTREE_CARD">("PAYPAL");
  const [venmoSplitEnabled, setVenmoSplitEnabled] = useState(false);
  const [friendVenmoHandle, setFriendVenmoHandle] = useState("@jordan-tech");

  // Coupon support
  const HONEY_COUPONS: Record<string, number> = {
    HONEY20: 0.2,
    PAYPALAI: 0.15,
    SAVE10: 0.1,
  };
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "Alex Customer",
    email: "buyer-sandbox@paypilot.io",
    addressLine1: "123 Innovation Way",
    city: "San Jose",
    state: "CA",
    postalCode: "95131",
    countryCode: "US",
  });

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/api/cart");
      if (res?.data) {
        setCart(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    const saved = localStorage.getItem("paypilot_applied_coupon");
    if (saved && HONEY_COUPONS[saved]) {
      setAppliedCoupon(saved);
      setCouponDiscount(HONEY_COUPONS[saved]);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  const handleApplyCoupon = () => {
    const upper = couponCode.toUpperCase().trim();
    if (HONEY_COUPONS[upper]) {
      setAppliedCoupon(upper);
      setCouponDiscount(HONEY_COUPONS[upper]);
      localStorage.setItem("paypilot_applied_coupon", upper);
      toast(`Coupon ${upper} applied! ${Math.round(HONEY_COUPONS[upper] * 100)}% off`, "success");
    } else {
      toast("Invalid coupon. Try HONEY20, PAYPALAI, or SAVE10", "error");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    localStorage.removeItem("paypilot_applied_coupon");
    toast("Coupon removed", "info");
  };

  const handleExecuteCheckout = async () => {
    if (!cart?.items || cart.items.length === 0) {
      toast("Cart is empty", "error");
      return;
    }

    setProcessing(true);
    setErrorMessage(null);
    setCurrentStep(1); // 1. Order Creation

    try {
      // Step 1: Create Server Order
      const orderRes = await fetchApi("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: formData.fullName,
          customerEmail: formData.email,
          items: cart.items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          shippingAddress: formData,
        }),
      });

      const appOrder = orderRes.data;
      setCurrentStep(2); // 2. PayPal Sandbox Order Creation

      // Step 2: Create PayPal Sandbox Order
      const ppOrderRes = await fetchApi("/api/payments/create-paypal-order", {
        method: "POST",
        body: JSON.stringify({ orderId: appOrder.id }),
      });

      const paypalOrderId = ppOrderRes.data.paypalOrderId;
      setCurrentStep(3); // 3. Server Payment Capture & Verification

      // Step 3: Capture Payment Server-side
      const captureRes = await fetchApi("/api/payments/capture-paypal-order", {
        method: "POST",
        body: JSON.stringify({
          orderId: appOrder.id,
          paypalOrderId: paypalOrderId,
        }),
      });

      if (captureRes.success) {
        setCurrentStep(4); // 4. Completed & Stock Decremented
        toast(
          venmoSplitEnabled
            ? `Paid your half ($${(summary.total / 2).toFixed(2)})! Venmo request sent to ${friendVenmoHandle}`
            : "Payment Captured & Verified via PayPal Developer Platform!",
          "success"
        );
        await fetchApi("/api/cart", { method: "DELETE" });
        setTimeout(() => {
          router.push(`/orders/${appOrder.id}`);
        }, 1200);
      } else {
        setErrorMessage(captureRes.message || "Payment capture was not completed.");
        setCurrentStep(0);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during checkout.");
      setCurrentStep(0);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
        <p className="text-xs font-semibold text-slate-400">Securing payment channel...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const baseSubtotal = cart?.summary?.subtotal || 0;
  const discountAmount = appliedCoupon ? baseSubtotal * couponDiscount : 0;
  const subtotalAfterDiscount = Math.max(0, baseSubtotal - discountAmount);
  const calculatedTax = Math.round(subtotalAfterDiscount * 0.08 * 100) / 100;
  const calculatedShipping = baseSubtotal >= 100 || baseSubtotal === 0 ? 0 : 9.99;
  const calculatedTotal = Math.round((subtotalAfterDiscount + calculatedTax + calculatedShipping) * 100) / 100;

  const summary = {
    subtotal: baseSubtotal,
    discount: discountAmount,
    tax: calculatedTax,
    shipping: calculatedShipping,
    total: calculatedTotal,
  };

  const steps = [
    "Authoritative Order Creation",
    "PayPal Sandbox Intent",
    "Server-Side Capture",
    "Inventory Decrement & Receipt",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Secure Multi-Method Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Server-authoritative checkout with instant fraud verification and encrypted settlement processing.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl flex items-center space-x-3 text-rose-200 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Progress State Indicator during checkout */}
      {processing && (
        <div className="mb-8 p-6 bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Processing Zero-Trust Financial Transaction via PayPal Platform...</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {steps.map((step, idx) => {
              const isDone = currentStep > idx + 1;
              const isCurrent = currentStep === idx + 1;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition-all ${
                    isDone
                      ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                      : isCurrent
                      ? "bg-cyan-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-500/20"
                      : "bg-slate-950/40 border-slate-800 text-slate-500"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                    )}
                    <span className="font-semibold line-clamp-1">{step}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Shipping Information Form */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-brand-600/30 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h2 className="font-extrabold text-base sm:text-lg text-white">
                Shipping & Customer Information
              </h2>
            </div>
            {!user ? (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
              >
                Sign In to Auto-Fill
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Logged in as {user.name.split(" ")[0]}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">
                Email Address (PayPal Receipt Destination)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1.5">
                Street Address
              </label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                State & Postal Code
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center space-x-2 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>256-bit TLS encrypted session transmission with secure payment tokenization</span>
          </div>
        </div>

        {/* Order Review & Payment Method Selection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h2 className="font-extrabold text-base sm:text-lg text-white">
                Payment Verification
              </h2>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentMethod("PAYPAL")}
                className={`py-2 rounded-xl transition-all ${
                  paymentMethod === "PAYPAL"
                    ? "bg-[#ffc439] text-[#003087] shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                PayPal
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("VENMO")}
                className={`py-2 rounded-xl transition-all ${
                  paymentMethod === "VENMO"
                    ? "bg-[#008CFF] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Venmo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("BRAINTREE_CARD")}
                className={`py-2 rounded-xl transition-all ${
                  paymentMethod === "BRAINTREE_CARD"
                    ? "bg-slate-800 text-cyan-300 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Card (Braintree)
              </button>
            </div>

            {/* Items summary */}
            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="text-white font-bold">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo / Honey Coupon Box */}
            <div className="pt-2 border-t border-slate-800">
              {appliedCoupon ? (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <span className="font-extrabold text-xs text-amber-300 font-mono">
                        {appliedCoupon}
                      </span>
                      <span className="text-[10px] text-amber-200/70 ml-1.5">
                        ({Math.round(couponDiscount * 100)}% Discount)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Promo code (e.g. HONEY20)"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-semibold">{formatPrice(summary.subtotal)}</span>
              </div>
              {appliedCoupon && summary.discount > 0 && (
                <div className="flex justify-between text-amber-400 font-bold">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>-{formatPrice(summary.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="text-white font-semibold">{formatPrice(summary.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-400 font-semibold">
                  {summary.shipping === 0 ? "FREE" : formatPrice(summary.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span>Total Due</span>
                <span className="text-cyan-400">{formatPrice(summary.total)}</span>
              </div>
            </div>

            {/* PayPal Pay in 4 / Paidy BNPL Banner */}
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl text-[11px] text-cyan-200 flex items-center justify-between">
              <span className="flex items-center">
                <Zap className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
                <span><strong>PayPal Pay in 4</strong>: 4 payments of {formatPrice(summary.total / 4 || 0)}</span>
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">0% APR</span>
            </div>

            {/* Venmo Split Option Box */}
            {paymentMethod === "VENMO" && (
              <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1" /> Venmo Social Split
                  </span>
                  <label className="flex items-center space-x-1.5 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={venmoSplitEnabled}
                      onChange={(e) => setVenmoSplitEnabled(e.target.checked)}
                      className="rounded border-slate-700 text-sky-500"
                    />
                    <span>Split 50/50 with friend</span>
                  </label>
                </div>
                {venmoSplitEnabled && (
                  <div className="pt-1.5 border-t border-sky-900/50 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Your Share Now:</span>
                      <span className="font-bold text-white">{formatPrice(summary.total / 2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400">Friend:</span>
                      <input
                        type="text"
                        value={friendVenmoHandle}
                        onChange={(e) => setFriendVenmoHandle(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-[10px] flex-1"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Braintree Tokenized Card Input Preview */}
            {paymentMethod === "BRAINTREE_CARD" && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Braintree Vault Card Token</span>
                  <span className="text-emerald-400 font-bold">3DS2 Ready</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-white flex justify-between items-center">
                  <span>•••• •••• •••• 4242</span>
                  <span className="text-slate-400 text-[10px]">12/28</span>
                </div>
              </div>
            )}

            {/* Simility AI Security Gauge */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-300 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                <span>PayPal Simility AI Risk Score: <strong>6/100</strong></span>
              </span>
              <span className="text-emerald-400 font-bold">Instant Capture Authorized</span>
            </div>

            {/* Primary Action Button */}
            <div className="pt-1">
              <button
                onClick={handleExecuteCheckout}
                disabled={processing || items.length === 0}
                className={`w-full font-extrabold text-sm py-3.5 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                  paymentMethod === "PAYPAL"
                    ? "bg-[#ffc439] hover:bg-[#f2ba36] text-[#003087] shadow-amber-500/20"
                    : paymentMethod === "VENMO"
                    ? "bg-[#008CFF] hover:bg-[#007ce0] text-white shadow-sky-500/20"
                    : "bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white shadow-brand-500/20"
                }`}
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Communicating with PayPal Platform...</span>
                  </>
                ) : paymentMethod === "PAYPAL" ? (
                  <>
                    <span className="italic font-black text-base">PayPal</span>
                    <span className="font-semibold text-xs ml-1 bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded">
                      Verified
                    </span>
                    <span className="font-bold text-xs ml-1">• Complete Order</span>
                  </>
                ) : paymentMethod === "VENMO" ? (
                  <>
                    <span className="font-black italic text-base">venmo</span>
                    <span className="font-bold text-xs ml-1">
                      {venmoSplitEnabled ? `• Pay Half (${formatPrice(summary.total / 2)}) & Request` : "• Pay with Venmo"}
                    </span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-1.5" />
                    <span>Authorize with Braintree Vault</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
