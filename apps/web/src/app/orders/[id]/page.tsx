"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Package,
  Calendar,
  CreditCard,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { fetchApi } from "../../../lib/api";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await fetchApi(`/api/orders/${orderId}`);
        if (res?.data) {
          setOrder(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
        <p className="text-sm text-slate-500">Retrieving verified order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">We could not locate this order in our system.</p>
        <Link href="/" className="inline-block bg-brand-600 text-white text-xs px-4 py-2 rounded-xl">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const payment = order.payments?.[0];
  const shipping = order.shippingAddress ? JSON.parse(order.shippingAddress) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Success banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold tracking-tight">Payment Verified</h1>
              <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/30">
                {order.status}
              </span>
            </div>
            <p className="text-emerald-100 text-xs mt-1">
              Order #{order.orderNumber} • Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-1.5"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Receipt & Item details */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Package className="w-4 h-4 text-brand-600" />
            <span>Purchased Items</span>
          </h3>

          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-xs sm:text-sm">
                <div>
                  <div className="font-bold text-slate-800">{item.productName}</div>
                  <div className="text-slate-400 text-xs">
                    Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                  </div>
                </div>
                <div className="font-extrabold text-slate-900">
                  ${item.lineTotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "FREE" : `$${order.shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Paid</span>
              <span className="text-brand-700">${order.total.toFixed(2)} {order.currency}</span>
            </div>
          </div>
        </div>

        {/* Payment & Shipping Sidebar */}
        <div className="space-y-6">
          {/* Payment metadata */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-xs tracking-wider uppercase flex items-center space-x-1.5 text-brand-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PayPal Verification</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">PayPal Order ID</span>
                <span className="font-mono text-slate-800 font-medium">
                  {payment?.paypalOrderId || "MOCK-SANDBOX-ORD"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Capture ID</span>
                <span className="font-mono text-emerald-700 font-bold">
                  {payment?.paypalCaptureId || "CAPTURE-VERIFIED-100"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payer Email</span>
                <span className="text-slate-800">{payment?.payerEmail || order.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {shipping && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 text-xs tracking-wider uppercase mb-2">
                Shipping Destination
              </h3>
              <p className="font-semibold text-slate-800">{shipping.fullName}</p>
              <p className="text-slate-500">{shipping.addressLine1}</p>
              <p className="text-slate-500">
                {shipping.city}, {shipping.state} {shipping.postalCode}
              </p>
              <p className="text-slate-500">{shipping.countryCode}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
