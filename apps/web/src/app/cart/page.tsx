"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, ShoppingCart, ArrowRight, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { fetchApi } from "../../lib/api";

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    try {
      await fetchApi(`/api/cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity: newQty }),
      });
      loadCart();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await fetchApi(`/api/cart/items/${itemId}`, { method: "DELETE" });
      loadCart();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
        <p className="text-sm text-slate-500">Loading your shopping cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const summary = cart?.summary || { subtotal: 0, tax: 0, shipping: 0, total: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review your selected gear before server-verified PayPal checkout.
          </p>
        </div>
        <Link
          href="/"
          className="text-xs sm:text-sm text-brand-600 font-semibold flex items-center hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-800">Your cart is currently empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore our curated catalogue of high-performance developer headphones, accessories, and gear.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition-all"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-4"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100 border border-slate-100"
                />

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-slate-900 text-sm">{item.product.name}</h3>
                  <span className="text-xs text-slate-500">{item.product.category}</span>
                  <div className="text-brand-700 font-bold text-sm mt-1">
                    ${item.unitPrice.toFixed(2)}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
                  <button
                    onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-100 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-100 text-xs font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-900">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-0.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm h-fit space-y-5">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">${summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-800">${summary.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-slate-800">
                  {summary.shipping === 0 ? "FREE" : `$${summary.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Amount</span>
                <span className="text-brand-700">${summary.total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-brand-600/20 transition-all hover:shadow-lg"
            >
              <span>Proceed to PayPal Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Sandbox Server-Verified Payments</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
