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
  ShoppingBag,
} from "lucide-react";
import { fetchApi } from "../../lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  }, []);

  const handlePayPalSandboxCheckout = async () => {
    if (!cart?.items || cart.items.length === 0) {
      alert("Cart is empty");
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      // Step 1: Create Server-side authoritative Order
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

      // Step 2: Create PayPal Sandbox Order
      const ppOrderRes = await fetchApi("/api/payments/create-paypal-order", {
        method: "POST",
        body: JSON.stringify({ orderId: appOrder.id }),
      });

      const paypalOrderId = ppOrderRes.data.paypalOrderId;

      // Step 3: Capture Payment Server-side
      const captureRes = await fetchApi("/api/payments/capture-paypal-order", {
        method: "POST",
        body: JSON.stringify({
          orderId: appOrder.id,
          paypalOrderId: paypalOrderId,
        }),
      });

      if (captureRes.success) {
        // Clear cart
        await fetchApi("/api/cart", { method: "DELETE" });
        router.push(`/orders/${appOrder.id}`);
      } else {
        setErrorMessage(captureRes.message || "Payment capture was not completed.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during checkout.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
        <p className="text-sm text-slate-500">Preparing secure checkout session...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const summary = cart?.summary || { subtotal: 0, tax: 0, shipping: 0, total: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Server-side PayPal Sandbox order orchestration with stock reservation and audit logging.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Shipping Information Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="font-bold text-base sm:text-lg text-slate-900">
              Shipping Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State & Postal Code
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>256-bit encrypted checkout transmission</span>
          </div>
        </div>

        {/* Order Review & PayPal Payment Trigger */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="font-bold text-base sm:text-lg text-slate-900">
                Payment & Review
              </h2>
            </div>

            {/* Items summary */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="text-slate-900 font-bold">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>${summary.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{summary.shipping === 0 ? "FREE" : `$${summary.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Due</span>
                <span className="text-brand-700">${summary.total.toFixed(2)}</span>
              </div>
            </div>

            {/* PayPal Button Trigger */}
            <div className="pt-2">
              <button
                onClick={handlePayPalSandboxCheckout}
                disabled={processing || items.length === 0}
                className="w-full bg-[#ffc439] hover:bg-[#f2ba36] disabled:opacity-50 text-[#003087] font-extrabold text-sm py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#003087]" />
                    <span>Communicating with PayPal Sandbox...</span>
                  </>
                ) : (
                  <>
                    <span className="italic font-black text-base">PayPal</span>
                    <span className="font-semibold text-xs ml-1 bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded">
                      Sandbox
                    </span>
                    <span className="font-medium text-xs ml-1">• Complete Order</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
              <div className="font-semibold text-slate-700 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                <span>Zero-Trust Security Verification</span>
              </div>
              <p>
                Order creation and payment capture execute entirely on the backend. No client-side price overrides are accepted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
