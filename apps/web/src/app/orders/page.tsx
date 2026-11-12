"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Calendar,
  CreditCard,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  User,
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useCurrency } from "../../lib/currency";
import { useAuth } from "../../lib/auth";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const { user, openAuthModal } = useAuth();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/api/orders");
      if (res?.data) {
        setOrders(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed & Verified
          </span>
        );
      case "PAYMENT_PENDING":
      case "PENDING_APPROVAL":
        return (
          <span className="flex items-center text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 mr-1" /> Payment Processing
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2.5 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5 mr-1" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-8 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <Package className="w-8 h-8 text-cyan-400" />
            <span>Order History & Receipts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authoritative financial records with cryptographic verification and PayPal capture details.
          </p>
        </div>

        {user ? (
          <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-2xl">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Viewing orders for <strong>{user.email}</strong></span>
          </div>
        ) : (
          <Link
            href="/login?redirect=/orders"
            className="flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Sign In to Sync Orders</span>
          </Link>
        )}
      </div>

      {/* Orders List */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
            <p className="text-xs font-semibold text-slate-400">Loading verified order records...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 bg-slate-900/60 border border-slate-800 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">No Orders Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You haven&apos;t placed any orders yet. Explore our curated catalogue and test the autonomous checkout copilot!
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="p-6 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-3xl transition-all shadow-xl space-y-4 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-extrabold text-sm text-cyan-400">
                      #{order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400 text-xs">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span>Customer: {order.customerName}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total</p>
                    <p className="font-black text-lg text-white">{formatPrice(order.total)}</p>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="p-2.5 rounded-xl bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-2">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
