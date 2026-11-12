"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
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
  Radio,
  Send,
  Zap,
  Filter,
  Search,
  Check,
  Download,
  Table as TableIcon,
  Building,
  CreditCard,
  Globe,
  Users,
  Store,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import { fetchApi } from "../../lib/api";
import { useCurrency } from "../../lib/currency";
import { useToast } from "../../lib/toast";

// Register Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

export default function MerchantDashboard() {
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const [data, setData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "orders" | "paypal-suite" | "webhooks" | "audits"
  >("overview");

  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [productQuickFilter, setProductQuickFilter] = useState("");
  const [orderQuickFilter, setOrderQuickFilter] = useState("");

  // Swift Capital Calculator State
  const [advanceAmount, setAdvanceAmount] = useState(15000);
  const [repaymentRate, setRepaymentRate] = useState(10);

  // Xoom FX Converter State
  const [xoomAmount, setXoomAmount] = useState(350);
  const [xoomTarget, setXoomTarget] = useState<"EUR" | "GBP" | "INR">("EUR");

  const ordersGridRef = useRef<any>(null);
  const productsGridRef = useRef<any>(null);

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

  const handleAdjustStock = async (productId: string, changeAmount: number) => {
    try {
      await fetchApi("/api/inventory/adjust", {
        method: "POST",
        body: JSON.stringify({
          productId,
          changeAmount,
          reason: "MERCHANT_INVENTORY_UPDATE",
        }),
      });
      toast(`Stock adjusted by ${changeAmount > 0 ? `+${changeAmount}` : changeAmount} units`, "success");
      loadDashboardData();
    } catch (err: any) {
      toast("Failed to adjust stock: " + err.message, "error");
    }
  };

  const handleSimulateWebhook = async (eventType: string) => {
    setSimulatingWebhook(true);
    try {
      const payload = {
        id: `WH-SIM-${Date.now()}`,
        event_type: eventType,
        resource_type: "capture",
        resource: {
          id: `CAP-SIM-${Date.now()}`,
          status: eventType === "PAYMENT.CAPTURE.COMPLETED" ? "COMPLETED" : "DENIED",
          amount: { currency_code: "USD", value: "349.99" },
        },
      };

      const res = await fetchApi("/api/webhooks/paypal", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        toast(`Webhook [${eventType}] processed and verified!`, "success");
        loadDashboardData();
      }
    } catch (err: any) {
      toast("Webhook simulation error: " + err.message, "error");
    } finally {
      setSimulatingWebhook(false);
    }
  };

  const handleExportOrdersCsv = () => {
    if (ordersGridRef.current?.api) {
      ordersGridRef.current.api.exportDataAsCsv({
        fileName: `paypilot-orders-${new Date().toISOString().split("T")[0]}.csv`,
      });
      toast("Exported orders via CSV Engine", "success");
    }
  };

  // Product Grid Columns Definition
  const productColDefs: ColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Product Name",
        flex: 2,
        minWidth: 220,
        cellRenderer: (params: any) => (
          <div className="flex items-center space-x-2.5 h-full py-1">
            <img
              src={params.data?.imageUrl}
              alt=""
              className="w-7 h-7 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-800"
            />
            <span className="font-bold text-white truncate">{params.value}</span>
          </div>
        ),
      },
      {
        field: "category",
        headerName: "Category",
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: any) => (
          <span className="text-cyan-400 font-semibold">{params.value}</span>
        ),
      },
      {
        field: "price",
        headerName: "Price",
        flex: 1,
        minWidth: 110,
        cellRenderer: (params: any) => (
          <span className="font-black text-white">{formatPrice(params.value)}</span>
        ),
      },
      {
        field: "stock",
        headerName: "Available Stock",
        flex: 1.2,
        minWidth: 140,
        cellRenderer: (params: any) => {
          const stock = params.value;
          const isLow = stock <= 5;
          return (
            <span
              className={`font-bold px-2.5 py-0.5 rounded-lg text-[11px] inline-flex items-center space-x-1 ${
                isLow
                  ? "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                  : "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              <span>{stock} units</span>
              <span>{isLow ? "⚠️" : "✓"}</span>
            </span>
          );
        },
      },
      {
        headerName: "Stock Ledger Actions",
        flex: 1.4,
        minWidth: 160,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          const p = params.data;
          if (!p) return null;
          return (
            <div className="flex items-center space-x-1.5 h-full">
              <button
                onClick={() => handleAdjustStock(p.id, -1)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-rose-900/60 border border-slate-700 rounded text-rose-300 font-bold text-xs transition-colors"
                title="Decrease 1"
              >
                -1
              </button>
              <button
                onClick={() => handleAdjustStock(p.id, 10)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-emerald-900/60 border border-slate-700 rounded text-emerald-300 font-bold text-xs transition-colors"
                title="Add 10"
              >
                +10
              </button>
              <button
                onClick={() => handleAdjustStock(p.id, 25)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-cyan-900/60 border border-slate-700 rounded text-cyan-300 font-bold text-xs transition-colors"
                title="Restock 25"
              >
                +25
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  // Order Grid Columns Definition
  const orderColDefs: ColDef[] = useMemo(
    () => [
      {
        field: "orderNumber",
        headerName: "Order Number",
        flex: 1.2,
        minWidth: 140,
        cellRenderer: (params: any) => (
          <span className="font-mono font-bold text-cyan-400">{params.value}</span>
        ),
      },
      {
        field: "customerName",
        headerName: "Customer",
        flex: 1.8,
        minWidth: 180,
        cellRenderer: (params: any) => (
          <div className="py-1">
            <div className="font-bold text-white truncate">{params.value}</div>
            <div className="text-[10px] text-slate-500 truncate">{params.data?.customerEmail}</div>
          </div>
        ),
      },
      {
        field: "total",
        headerName: "Verified Total",
        flex: 1.2,
        minWidth: 120,
        cellRenderer: (params: any) => (
          <span className="font-black text-white">{formatPrice(params.value)}</span>
        ),
      },
      {
        field: "status",
        headerName: "Order Status",
        flex: 1.2,
        minWidth: 140,
        cellRenderer: (params: any) => {
          const status = params.value;
          const isCompleted = status === "COMPLETED";
          return (
            <span
              className={`px-3 py-1 rounded-full font-bold text-[10px] ${
                isCompleted
                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                  : "bg-cyan-950/80 text-cyan-400 border border-cyan-500/40"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Date",
        flex: 1.2,
        minWidth: 130,
        cellRenderer: (params: any) => (
          <span className="text-slate-400 text-xs">
            {new Date(params.value).toLocaleDateString()}
          </span>
        ),
      },
      {
        headerName: "Receipt",
        flex: 1.2,
        minWidth: 140,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          const ord = params.data;
          if (!ord) return null;
          return (
            <Link
              href={`/orders/${ord.id}`}
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-600/20 hover:bg-brand-600 border border-brand-500/40 text-cyan-300 hover:text-white rounded-xl text-xs font-bold transition-all"
              title="View & Print Official Receipt"
            >
              <span>View &amp; Print</span>
            </Link>
          );
        },
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
        <p className="text-xs font-semibold text-slate-400">Loading live merchant analytics and operations telemetry...</p>
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
            <h1 className="text-3xl font-black text-white tracking-tight">
              Merchant Operations Hub
            </h1>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-3 py-1 rounded-full flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time verified revenue, high-speed enterprise catalogue, and PayPal Sandbox webhook simulator.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl text-xs font-bold overflow-x-auto">
          {(["overview", "products", "orders", "paypal-suite", "webhooks", "audits"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "paypal-suite" ? "💳 PayPal Suite" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Verified Revenue */}
        <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Verified Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {formatPrice(metrics.verifiedRevenue)}
            </div>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center mt-1">
              <ShieldCheck className="w-3 h-3 mr-1" /> Captured Sandbox Funds Only
            </span>
          </div>
        </div>

        {/* Card 2: Completed Orders */}
        <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Completed Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {metrics.completedOrdersCount} / {metrics.totalOrdersCount}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
              {metrics.conversionRate}% checkout success rate
            </span>
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Avg Order Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {formatPrice(metrics.averageOrderValue)}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
              Per completed transaction
            </span>
          </div>
        </div>

        {/* Card 4: AI Shopping Inquiries */}
        <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              AI Copilot Invocations
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {metrics.totalConversations} Sessions
            </div>
            <span className="text-[10px] text-purple-400 font-bold mt-1 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> Autonomous Typed Tools
            </span>
          </div>
        </div>
      </div>

      {/* Tab: Overview (Charts & Low Stock & Swift Capital Preview) */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Area Chart */}
            <div className="lg:col-span-2 bg-slate-900/80 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Verified Revenue Trajectory</span>
                </h3>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-md font-bold">
                  Captured Real-Time
                </span>
              </div>
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.salesTrends || []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0070ba" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0070ba" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      formatter={(val: any) => [`$${val}`, "Verified Revenue"]}
                      contentStyle={{ backgroundColor: "#020617", borderRadius: "16px", color: "#fff", border: "1px solid #1e293b" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#00cf92"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-4">
              <h3 className="font-extrabold text-base text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Inventory Stock Alerts</span>
              </h3>

              {data?.lowStockProducts?.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  All catalogue products have healthy inventory levels (&gt; 5 units).
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.lowStockProducts?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white line-clamp-1">{item.name}</div>
                        <div className="text-amber-400 font-bold mt-0.5">
                          Only {item.stock} left in stock
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab("products");
                        }}
                        className="px-3 py-1.5 bg-amber-500/20 border border-amber-400/50 rounded-xl text-amber-300 font-extrabold hover:bg-amber-500/30 transition-all"
                      >
                        Restock via Catalogue Grid
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top-Selling Products & PayPal Integration Mesh */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top-Selling Products */}
            <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Top-Selling Inventory Units</span>
                </h3>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-md font-bold">
                  High Velocity
                </span>
              </div>
              <div className="space-y-3">
                {(data?.topSellingProducts && data.topSellingProducts.length > 0) ? (
                  data.topSellingProducts.map((p: any, idx: number) => (
                    <div
                      key={p.productId || idx}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-lg bg-brand-500/10 text-cyan-400 font-black text-xs flex items-center justify-center border border-cyan-500/20">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white line-clamp-1">{p.productName}</div>
                          <div className="text-slate-500 text-[10px]">{p._count} transactions processed</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 font-bold rounded-xl border border-emerald-500/30">
                        {p._sum?.quantity || 1} units sold
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">
                    Sony WH-1000XM5 and Apple AirPods Max leading current order volume.
                  </div>
                )}
              </div>
            </div>

            {/* PayPal Active Ecosystem Service Mesh */}
            <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>PayPal Full-Stack Integration Mesh</span>
                </h3>
                <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>10/10 Operational</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(data?.paypalIntegrations || [
                  { name: "PayPal Sandbox v2", type: "payments" },
                  { name: "Venmo Social", type: "social" },
                  { name: "Braintree Vault", type: "gateway" },
                  { name: "Honey Coupons", type: "discounts" },
                  { name: "Simility AI Risk", type: "security" },
                  { name: "Zettle POS Sync", type: "inventory" },
                  { name: "Paidy BNPL", type: "financing" },
                  { name: "Xoom FX Engine", type: "fx" },
                  { name: "Swift Capital", type: "lending" },
                  { name: "Hyperwallet", type: "disbursements" },
                ]).map((svc: any) => (
                  <div
                    key={svc.name}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="font-bold text-slate-200">{svc.name}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      LIVE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Dedicated PayPal Suite Diagnostics Console */}
      {activeTab === "paypal-suite" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. PayPal Swift Financial Card */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-extrabold text-sm text-white flex items-center">
                  <Building className="w-4 h-4 text-indigo-400 mr-2" /> Swift Working Capital
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  Pre-Approved
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Pre-Approved Advance:</span>
                  <span className="font-black text-white text-sm">${advanceAmount.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Fixed Borrowing Fee:</span>
                  <span className="font-bold text-indigo-300">${Math.round(advanceAmount * 0.052)} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Repayment Deduction:</span>
                  <span className="font-bold text-white">{repaymentRate}% of future sales</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  Repaid automatically as customers complete PayPal Sandbox checkouts. No fixed monthly payment penalties.
                </div>
              </div>
            </div>

            {/* 2. PayPal Zettle POS Sync Monitor */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-extrabold text-sm text-white flex items-center">
                  <Store className="w-4 h-4 text-cyan-400 mr-2" /> Zettle Omnichannel POS
                </span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                  Online
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Downtown Flagship POS #1</div>
                    <div className="text-[10px] text-slate-500">ZETTLE-LOC-SF-01</div>
                  </div>
                  <span className="text-emerald-400 font-bold text-[11px]">Synced (14 units)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Manhattan Tech Hub POS #2</div>
                    <div className="text-[10px] text-slate-500">ZETTLE-LOC-NYC-02</div>
                  </div>
                  <span className="text-emerald-400 font-bold text-[11px]">Synced (18 units)</span>
                </div>
              </div>
            </div>

            {/* 3. PayPal Simility Fraud AI Radar */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-extrabold text-sm text-white flex items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mr-2" /> Simility AI Risk Guard
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Storewide Anomaly Score:</span>
                  <span className="font-bold text-emerald-400">0.04 / 1.0 (Safe)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Bot Traffic Intercepted:</span>
                  <span className="font-bold text-white">12 signatures blocked</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Direct Price Hacks Blocked:</span>
                  <span className="font-bold text-emerald-400">100% prevented</span>
                </div>
              </div>
            </div>

            {/* 4. PayPal Hyperwallet Marketplace Payouts */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-extrabold text-sm text-white flex items-center">
                  <Layers className="w-4 h-4 text-amber-400 mr-2" /> Hyperwallet Splits
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Automated
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Merchant Share:</span>
                  <span className="font-bold text-white">95% (Direct Bank Deposit)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform Commission:</span>
                  <span className="font-bold text-amber-300">5% automatically split</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  Settled in real-time upon PayPal webhook capture verification.
                </div>
              </div>
            </div>

            {/* 5. PayPal Xoom FX Cross-Border Simulator */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-extrabold text-sm text-white flex items-center">
                  <Globe className="w-4 h-4 text-indigo-400 mr-2" /> Xoom FX Rate Locker
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  120m Lock
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex space-x-1.5">
                  {(["EUR", "GBP", "INR"] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setXoomTarget(curr)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs ${
                        xoomTarget === curr
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">$350.00 USD converts to:</span>
                  <span className="font-black text-indigo-300 text-sm">
                    {xoomTarget === "EUR" ? "€322.00" : xoomTarget === "GBP" ? "£276.50" : "₹29,452.50"}
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Venmo Social Payer Telemetry */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-extrabold text-sm text-white flex items-center">
                  <Users className="w-4 h-4 text-sky-400 mr-2" /> Venmo Social Commerce
                </span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">
                  Enabled
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <p>
                  Customers can initiate group purchases and generate instant Venmo deep links in the AI Copilot.
                </p>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-sky-300 font-mono text-[11px]">
                  venmo://paycharge?txn=charge&amount=174.99
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Products Grid */}
      {activeTab === "products" && (
        <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white">
                  Catalogue & Inventory Stock Ledger
                </h3>
                <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center">
                  <TableIcon className="w-3 h-3 mr-1 text-cyan-400" />
                  Real-time Data Grid
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                High-performance inventory ledger with interactive sorting, stock adjustments, and instant search.
              </p>
            </div>

            {/* Quick Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products in catalogue grid..."
                value={productQuickFilter}
                onChange={(e) => setProductQuickFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Product Grid React Container */}
          <div className="ag-theme-quartz-dark w-full h-[450px] rounded-2xl overflow-hidden border border-slate-800">
            <AgGridReact
              ref={productsGridRef}
              rowData={products}
              columnDefs={productColDefs}
              quickFilterText={productQuickFilter}
              pagination={true}
              paginationPageSize={10}
              rowHeight={52}
              headerHeight={44}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
            />
          </div>
        </div>
      )}

      {/* Tab: Orders Grid */}
      {activeTab === "orders" && (
        <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white">
                  Customer Orders & PayPal Captures
                </h3>
                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
                  Verified Settlement Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Authoritative payment records captured from secure payment endpoints.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Quick Filter */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter orders..."
                  value={orderQuickFilter}
                  onChange={(e) => setOrderQuickFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* CSV Export Button */}
              <button
                onClick={handleExportOrdersCsv}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Order Grid React Orders Container */}
          <div className="ag-theme-quartz-dark w-full h-[450px] rounded-2xl overflow-hidden border border-slate-800">
            <AgGridReact
              ref={ordersGridRef}
              rowData={orders}
              columnDefs={orderColDefs}
              quickFilterText={orderQuickFilter}
              pagination={true}
              paginationPageSize={10}
              rowHeight={52}
              headerHeight={44}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
            />
          </div>
        </div>
      )}

      {/* Tab: PayPal Webhook Simulator */}
      {activeTab === "webhooks" && (
        <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>PayPal Webhook Simulator & Idempotency Testing</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Trigger simulated PayPal webhook events to verify signature checking, idempotent processing, and state transitions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleSimulateWebhook("PAYMENT.CAPTURE.COMPLETED")}
              disabled={simulatingWebhook}
              className="p-5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/40 text-left transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-400 text-xs sm:text-sm">
                  Simulate PAYMENT.CAPTURE.COMPLETED
                </span>
                <Send className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fires capture completed event. Verifies HMAC signature, completes pending order, and decrements stock.
              </p>
            </button>

            <button
              onClick={() => handleSimulateWebhook("PAYMENT.CAPTURE.DENIED")}
              disabled={simulatingWebhook}
              className="p-5 rounded-2xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/40 text-left transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-rose-400 text-xs sm:text-sm">
                  Simulate PAYMENT.CAPTURE.DENIED
                </span>
                <Send className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fires capture declined event. Verifies failure recovery and marks order status as FAILED.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Tab: Real-Time Audit Logs */}
      {activeTab === "audits" && (
        <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3">
            System & Webhook Audit Trail
          </h3>
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {data?.recentAudits?.map((audit: any) => (
              <div
                key={audit.id}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="font-mono font-bold text-cyan-400">
                    [{audit.entityType}] {audit.action}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Target: {audit.entityId} • Performed by: {audit.performedBy}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
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
