"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  Sparkles,
  Bot,
  RefreshCw,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { fetchApi } from "../../lib/api";

export default function MerchantDashboard() {
  const [data, setData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "audits">("overview");

  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(0);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, prodRes, ordRes] = await Promise.all([
        fetchApi("/api/analytics/dashboard"),
        fetchApi("/api/products"),
        fetchApi("/api/orders"),
      ]);

      setData(dashRes.data);
      setProducts(prodRes.data);
      setOrders(ordRes.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAdjustStock = async (productId: string) => {
    try {
      await fetchApi("/api/inventory/adjust", {
        method: "POST",
        body: JSON.stringify({
          productId,
          changeAmount: stockDelta,
          reason: "MERCHANT_MANUAL_UPDATE",
        }),
      });
      setEditingStockId(null);
      setStockDelta(0);
      loadDashboardData();
    } catch (err: any) {
      alert("Failed to adjust stock: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-2" />
        <p className="text-sm text-slate-500">Loading merchant analytics & real-time telemetry...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    verifiedRevenue: 0,
    totalOrdersCount: 0,
    completedOrdersCount: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    totalProducts: 0,
    totalConversations: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Merchant Operations Hub
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time verified revenue, stock reservation logs, and AI conversion telemetry.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1 rounded-2xl text-xs font-semibold">
          {(["overview", "products", "orders", "audits"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Verified Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Verified Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              ${metrics.verifiedRevenue.toFixed(2)}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center mt-0.5">
              <ShieldCheck className="w-3 h-3 mr-1" /> Verified Captured Funds Only
            </span>
          </div>
        </div>

        {/* Card 2: Completed Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Completed Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {metrics.completedOrdersCount} / {metrics.totalOrdersCount}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
              {metrics.conversionRate}% checkout completion rate
            </span>
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg Order Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              ${metrics.averageOrderValue.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
              Per verified transaction
            </span>
          </div>
        </div>

        {/* Card 4: AI Shopping Inquiries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              AI Interactions
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {metrics.totalConversations} Sessions
            </div>
            <span className="text-[11px] text-purple-600 font-semibold mt-0.5 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> LangGraph Copilot Invocations
            </span>
          </div>
        </div>
      </div>

      {/* Tab: Overview (Charts & Low Stock) */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <span>Verified Revenue Growth</span>
            </h3>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.salesTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    formatter={(val: any) => [`$${val}`, "Verified Revenue"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", border: "none" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0070ba"
                    strokeWidth={3}
                    dot={{ fill: "#0070ba", r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Inventory Stock Alerts</span>
            </h3>

            {data?.lowStockProducts?.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                All products have healthy inventory levels (&gt; 5 units).
              </div>
            ) : (
              <div className="space-y-3">
                {data?.lowStockProducts?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 line-clamp-1">{item.name}</div>
                      <div className="text-amber-800 font-semibold mt-0.5">
                        Only {item.stock} remaining
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("products");
                        setEditingStockId(item.id);
                      }}
                      className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-amber-800 font-bold hover:bg-amber-100"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Products & Inventory Management */}
      {activeTab === "products" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-900">
              Product Catalogue & Real-Time Stock
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Total {products.length} catalog items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Available Stock</th>
                  <th className="pb-3 text-right">Quick Stock Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 flex items-center space-x-3">
                      <img src={p.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      <span className="line-clamp-1 max-w-xs">{p.name}</span>
                    </td>
                    <td className="py-3 text-slate-600">{p.category}</td>
                    <td className="py-3 font-bold text-slate-900">${p.price.toFixed(2)}</td>
                    <td className="py-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          p.stock <= 5
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {editingStockId === p.id ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <input
                            type="number"
                            placeholder="+/- qty"
                            value={stockDelta}
                            onChange={(e) => setStockDelta(parseInt(e.target.value, 10) || 0)}
                            className="w-20 px-2 py-1 border border-slate-300 rounded-lg text-xs"
                          />
                          <button
                            onClick={() => handleAdjustStock(p.id)}
                            className="bg-brand-600 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-brand-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="text-slate-400 hover:text-slate-600 px-1.5"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingStockId(p.id);
                            setStockDelta(10);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all inline-flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Adjust Stock</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Orders */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-900">
              Customer Orders & Payment Records
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {orders.length} total orders recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-brand-700">{o.orderNumber}</td>
                    <td className="py-3 text-slate-800">
                      <div className="font-semibold">{o.customerName}</div>
                      <div className="text-[10px] text-slate-400">{o.customerEmail}</div>
                    </td>
                    <td className="py-3 text-slate-600">{o.items?.length || 1} items</td>
                    <td className="py-3 font-extrabold text-slate-900">${o.total.toFixed(2)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          o.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.status === "PAYMENT_PENDING"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Real-Time Audit Logs */}
      {activeTab === "audits" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">
            System & Webhook Audit Trail
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data?.recentAudits?.map((audit: any) => (
              <div
                key={audit.id}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="font-mono font-bold text-brand-700">
                    [{audit.entityType}] {audit.action}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Target: {audit.entityId} • Performed by: {audit.performedBy}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(audit.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
