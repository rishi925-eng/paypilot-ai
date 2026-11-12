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
  Printer,
  QrCode,
  Sparkles,
  Download,
  Copy,
  Check,
  FileText,
  Building,
  ExternalLink,
  Hash,
  MapPin,
  Mail,
  User,
  Clock,
  Shield,
  Layers,
} from "lucide-react";
import { fetchApi } from "../../../lib/api";
import { useCurrency } from "../../../lib/currency";
import { useToast } from "../../../lib/toast";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { formatPrice, currency } = useCurrency();
  const { toast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"invoice" | "overview">("invoice");
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [resolutionResult, setResolutionResult] = useState<any>(null);

  useEffect(() => {
    if (!showDisputeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDisputeModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [showDisputeModal]);

  const handleTriggerAiResolution = async (issueType: string, requestedAction: string) => {
    try {
      setDisputeLoading(true);
      const res = await fetchApi(`/api/orders/${order.id}/resolution`, {
        method: "POST",
        body: JSON.stringify({
          issueType,
          description: `Customer submitted via AI Resolution Concierge`,
          requestedAction,
        }),
      });

      if (res.success) {
        setResolutionResult(res);
        setOrder(res.order);
        toast(`AI Resolution Approved! Refund of $${res.refundAmount} issued via PayPal Sandbox`, "success");
      }
    } catch (err: any) {
      toast("Resolution failed: " + err.message, "error");
    } finally {
      setDisputeLoading(false);
    }
  };

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

  // ─────────────────────────────────────────────────────────────────────────
  // Isolated Clean Receipt Printing (Prints ONLY the receipt, NO browser mess)
  // ─────────────────────────────────────────────────────────────────────────
  const handlePrintOnlyReceipt = () => {
    const receiptEl = document.getElementById("official-print-receipt");
    if (!receiptEl) {
      window.print();
      return;
    }

    // Create an invisible iframe for isolated printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Receipt_${order?.orderNumber || "Invoice"}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 10mm 12mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              font-size: 11pt;
              line-height: 1.45;
              padding: 10px;
            }
            .receipt-container {
              width: 100%;
              max-width: 780px;
              margin: 0 auto;
              background: #ffffff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .brand-logo {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 8px;
            }
            .logo-icon {
              width: 36px;
              height: 36px;
              background: #003087;
              color: #ffffff;
              font-weight: 900;
              font-size: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
            }
            .brand-name {
              font-size: 20px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .brand-tag {
              font-size: 9px;
              font-weight: 700;
              color: #0284c7;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .company-info {
              font-size: 9.5pt;
              color: #475569;
              line-height: 1.4;
            }
            .invoice-meta {
              text-align: right;
            }
            .badge-paid {
              display: inline-block;
              background: #dcfce7;
              color: #166534;
              font-size: 9pt;
              font-weight: 800;
              padding: 3px 10px;
              border-radius: 99px;
              border: 1px solid #86efac;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
            }
            .invoice-title {
              font-size: 22pt;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .meta-text {
              font-size: 9.5pt;
              color: #64748b;
            }
            .meta-strong {
              font-weight: 700;
              color: #0f172a;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .info-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 12px 14px;
            }
            .info-box-title {
              font-size: 8.5pt;
              font-weight: 800;
              text-transform: uppercase;
              color: #64748b;
              margin-bottom: 6px;
              letter-spacing: 0.5px;
            }
            .customer-name {
              font-size: 11pt;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 2px;
            }
            .customer-detail {
              font-size: 9.5pt;
              color: #475569;
              line-height: 1.35;
            }
            .ledger-row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              border-bottom: 1px dashed #e2e8f0;
              font-size: 9pt;
            }
            .ledger-row:last-child {
              border-bottom: none;
            }
            .ledger-label {
              color: #64748b;
            }
            .ledger-val {
              font-weight: 700;
              font-family: monospace;
              color: #0f172a;
            }
            .ledger-highlight {
              color: #0284c7;
              font-weight: 700;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background: #f1f5f9;
              color: #334155;
              font-size: 8.5pt;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 9px 12px;
              border-bottom: 2px solid #cbd5e1;
              text-align: left;
            }
            td {
              padding: 10px 12px;
              font-size: 9.5pt;
              border-bottom: 1px solid #e2e8f0;
              color: #1e293b;
            }
            .col-num { width: 36px; text-align: center; color: #94a3b8; font-weight: 700; }
            .col-qty { width: 60px; text-align: center; font-weight: 700; }
            .col-rate { width: 110px; text-align: right; font-family: monospace; }
            .col-total { width: 120px; text-align: right; font-weight: 800; font-family: monospace; color: #0f172a; }
            .item-title { font-weight: 800; color: #0f172a; font-size: 10pt; }
            .item-sku { font-size: 8pt; color: #94a3b8; font-family: monospace; }
            .summary-wrap {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 20px;
              margin-bottom: 20px;
              padding-top: 8px;
            }
            .terms-box {
              max-width: 380px;
              font-size: 8.5pt;
              color: #64748b;
              line-height: 1.45;
            }
            .terms-title {
              font-size: 8.5pt;
              font-weight: 800;
              color: #334155;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .totals-box {
              width: 280px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 12px 16px;
            }
            .total-line {
              display: flex;
              justify-content: space-between;
              font-size: 9pt;
              color: #475569;
              padding: 3px 0;
            }
            .total-line-strong {
              border-top: 2px solid #0f172a;
              margin-top: 6px;
              padding-top: 8px;
              display: flex;
              justify-content: space-between;
              align-items: baseline;
            }
            .grand-total-label {
              font-size: 10pt;
              font-weight: 900;
              color: #0f172a;
              text-transform: uppercase;
            }
            .grand-total-val {
              font-size: 15pt;
              font-weight: 900;
              color: #003087;
              font-family: monospace;
            }
            .footer-stamp {
              border-top: 1px dashed #cbd5e1;
              padding-top: 14px;
              margin-top: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 8pt;
              color: #64748b;
            }
            .barcode-box {
              font-family: monospace;
              letter-spacing: 2px;
              font-size: 8.5pt;
              color: #334155;
            }
            .barcode-visual {
              display: flex;
              align-items: center;
              gap: 1.5px;
              height: 24px;
              margin-bottom: 3px;
            }
            .b-bar {
              background: #0f172a;
              height: 100%;
            }
            .stamp-badge {
              border: 1.5px solid #0284c7;
              color: #0284c7;
              padding: 4px 10px;
              border-radius: 6px;
              font-weight: 800;
              font-size: 8pt;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${receiptEl.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Trigger print cleanly once iframe styles are rendered
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  };

  const handleSavePdf = () => {
    toast("Select 'Save as PDF' under Destination in the print dialog", "info");
    setTimeout(() => {
      handlePrintOnlyReceipt();
    }, 400);
  };

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      toast(`Copied Order #${order.orderNumber} to clipboard`, "success");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <RefreshCw className="w-10 h-10 animate-spin mx-auto text-cyan-400 mb-3" />
        <h2 className="text-base font-bold text-white">Verifying Transaction Ledger...</h2>
        <p className="text-xs text-slate-400 mt-1">Retrieving verified PayPal capture records from database.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <Hash className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-slate-400">
          We could not locate an order matching ID &ldquo;{orderId}&rdquo; in the database.
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-600 hover:bg-brand-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  const payment = order.payments?.[0];
  let shipping: any = null;
  try {
    shipping = order.shippingAddress ? JSON.parse(order.shippingAddress) : null;
  } catch {
    shipping = null;
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const paymentMethodLabel = payment?.paypalOrderId
    ? "PayPal Sandbox (Instant Capture)"
    : "PayPal Platform Secure Checkout";

  return (
    <div className="order-page-wrapper max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Action Bar & Success Header (Always Hidden on Print)                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="print:hidden space-y-6 mb-8">
        {/* Top Success Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">Payment Captured &amp; Verified</h1>
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-400/30">
                  {order.status}
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  Verified Settlement
                </span>
              </div>
              <p className="text-emerald-300/80 text-xs mt-1">
                Order #{order.orderNumber} • Timestamp: {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handlePrintOnlyReceipt}
              className="flex-1 md:flex-none bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
              title="Prints ONLY the official receipt formatted for A4 without browser chrome"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={handleSavePdf}
              className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
              title="Save clean receipt as PDF"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Save PDF</span>
            </button>
            <button
              onClick={() => setShowDisputeModal(true)}
              className="flex-1 md:flex-none bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
              title="Launch AI Post-Purchase Dispute & Instant Refund Concierge"
            >
              <Shield className="w-4 h-4 text-rose-400" />
              <span>AI Dispute &amp; Refund</span>
            </button>
            <Link
              href="/"
              className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* AI Dispute & Instant Refund Concierge Modal */}
        {showDisputeModal && (
          <div
            onClick={(e) => e.target === e.currentTarget && setShowDisputeModal(false)}
            className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
          >
            <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto my-auto shadow-2xl shadow-black/90 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-rose-400" />
                  <h3 className="font-extrabold text-base text-white">AI Resolution &amp; PayPal Refund Concierge</h3>
                </div>
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {resolutionResult ? (
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Instant Refund Settled!</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {resolutionResult.message}
                  </p>
                  <div className="text-[11px] font-mono text-cyan-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between">
                    <span>PayPal Transaction:</span>
                    <span className="font-bold">{resolutionResult.paypalRefundId}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowDisputeModal(false);
                      setResolutionResult(null);
                    }}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Close &amp; View Updated Invoice
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-300">
                    Select your issue to trigger an autonomous, zero-friction resolution authorized via PayPal Sandbox:
                  </p>

                  <button
                    disabled={disputeLoading}
                    onClick={() => handleTriggerAiResolution("COSMETIC_DAMAGE_IN_TRANSIT", "PARTIAL_REFUND")}
                    className="w-full p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all space-y-1 group cursor-pointer"
                  >
                    <div className="font-bold text-amber-300 flex justify-between">
                      <span>Damaged packaging / Cosmetic flaw</span>
                      <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">30% Partial Refund</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Keep the item. Automated 30% credit ({formatPrice(order.total * 0.3)}) refunded instantly.
                    </p>
                  </button>

                  <button
                    disabled={disputeLoading}
                    onClick={() => handleTriggerAiResolution("DEFECTIVE_UNIT_OR_DOA", "FULL_REFUND")}
                    className="w-full p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 text-left transition-all space-y-1 group cursor-pointer"
                  >
                    <div className="font-bold text-rose-300 flex justify-between">
                      <span>Defective unit / Hardware issue</span>
                      <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded-full">100% Full Refund</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Zero-friction 100% refund ({formatPrice(order.total)}) issued immediately to your funding source.
                    </p>
                  </button>

                  {disputeLoading && (
                    <div className="text-center py-2 text-cyan-400 flex items-center justify-center space-x-2 text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI evaluating claim against PayPal fraud heuristics...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Mode Switcher and Quick Tools */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("invoice")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === "invoice"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Official Tax Invoice Preview</span>
            </button>
            <button
              onClick={() => setViewMode("overview")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === "overview"
                  ? "bg-slate-800 text-cyan-400 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Card Overview</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={handleCopyOrderNumber}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl flex items-center space-x-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? "Copied!" : `Order #${order.orderNumber}`}</span>
            </button>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 rounded-xl flex items-center space-x-1.5 transition-all font-semibold"
            >
              <span>Merchant Ledger</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SCREEN VIEW: Modern Card Overview (Only shown when tab is active)   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewMode === "overview" && (
        <div className="print:hidden grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <h3 className="font-extrabold text-white text-base border-b border-slate-800 pb-3.5 flex items-center space-x-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <span>Purchased Line Items</span>
            </h3>

            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-slate-800/50 last:border-none">
                  <div>
                    <div className="font-bold text-white">{item.productName}</div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                    </div>
                  </div>
                  <div className="font-black text-white">{formatPrice(item.lineTotal)}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="text-white font-semibold">{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping &amp; Handling</span>
                <span className="text-emerald-400 font-semibold">
                  {order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2.5 border-t border-slate-800">
                <span>Total Amount Paid</span>
                <span className="text-cyan-400">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <h3 className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center space-x-1.5 text-cyan-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>PayPal Verification</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-400">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">PayPal Order ID</span>
                  <span className="font-mono text-slate-200 font-semibold text-[11px] break-all">
                    {payment?.paypalOrderId || "MOCK-SANDBOX-ORD"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Capture ID</span>
                  <span className="font-mono text-emerald-400 font-black text-[11px] break-all">
                    {payment?.paypalCaptureId || "CAPTURE-VERIFIED-100"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Payer Account</span>
                  <span className="text-slate-200">{payment?.payerEmail || order.customerEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Payment Method</span>
                  <span className="text-slate-200">{paymentMethodLabel}</span>
                </div>
              </div>
            </div>

            {shipping && (
              <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-2 text-xs">
                <h3 className="font-extrabold text-white text-xs tracking-wider uppercase mb-2 flex items-center space-x-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Shipping Destination</span>
                </h3>
                <p className="font-bold text-white">{shipping.fullName}</p>
                <p className="text-slate-400">{shipping.addressLine1}</p>
                <p className="text-slate-400">
                  {shipping.city}, {shipping.state} {shipping.postalCode}
                </p>
                <p className="text-slate-500">{shipping.countryCode || "US"}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* THE OFFICIAL PRINT RECEIPT (Clean, Pure Document for Print & Screen) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div
        id="official-print-receipt"
        className={`bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-200 ${
          viewMode === "invoice" ? "block" : "hidden print:block"
        }`}
      >
        {/* Header / Letterhead */}
        <div className="header flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b-2 border-slate-900 pb-6 mb-6">
          <div>
            <div className="brand-logo flex items-center gap-2.5 mb-2">
              <div className="logo-icon w-9 h-9 rounded-xl bg-[#003087] text-white font-black text-xl flex items-center justify-center shadow">
                P
              </div>
              <div>
                <h2 className="brand-name text-2xl font-black tracking-tight text-slate-950 uppercase leading-tight">
                  PayPilot AI
                </h2>
                <p className="brand-tag text-[9px] font-bold text-sky-600 tracking-wider uppercase">
                  Authorized Enterprise Commerce
                </p>
              </div>
            </div>
            <div className="company-info text-xs text-slate-600 space-y-0.5 mt-2">
              <p className="font-bold text-slate-800">PayPilot AI Inc. • Headquarters</p>
              <p>2211 North First Street, San Jose, CA 95131, United States</p>
              <p>Support: support@paypilot.io • Web: https://paypilot.io</p>
              <p className="text-[10px] font-mono text-slate-500">
                Sandbox Merchant ID: <strong className="text-slate-800">MERCHANT-SANDBOX-092</strong>
              </p>
            </div>
          </div>

          <div className="invoice-meta sm:text-right space-y-1">
            <span className="badge-paid inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-300 uppercase tracking-wider mb-1">
              Official Tax Invoice • Paid
            </span>
            <div className="invoice-title text-2xl sm:text-3xl font-black text-slate-950 tracking-tight font-mono">
              INV-{order.orderNumber}
            </div>
            <p className="meta-text text-xs text-slate-500">
              Transaction Date: <strong className="text-slate-800 font-sans">{formattedDate}</strong>
            </p>
            <p className="meta-text text-xs text-slate-500 font-mono">
              GST / Tax ID: <strong className="text-slate-800">US-PAYPAL-95131-TAX</strong>
            </p>
          </div>
        </div>

        {/* Customer & Payment Ledger Proof */}
        <div className="info-grid grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-200 text-xs">
          {/* Bill / Ship To */}
          <div className="info-box bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="info-box-title text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-blue-600 mr-1 inline" />
              <span>Billed &amp; Shipped To</span>
            </div>
            <p className="customer-name font-black text-sm text-slate-900 mb-1">
              {shipping?.fullName || order.customerName || "Valued Customer"}
            </p>
            <p className="customer-detail text-slate-600 flex items-center space-x-1.5 mb-1.5">
              <Mail className="w-3 h-3 text-slate-400 mr-1 inline" />
              <span>{order.customerEmail}</span>
            </p>
            {shipping ? (
              <div className="customer-detail text-slate-600 pt-1 space-y-0.5 border-t border-slate-200/60">
                <p>{shipping.addressLine1}</p>
                <p>
                  {shipping.city}, {shipping.state} {shipping.postalCode}
                </p>
                <p className="font-bold text-slate-700">{shipping.countryCode || "United States"}</p>
              </div>
            ) : (
              <p className="text-slate-400 italic">Standard Direct Fulfillment</p>
            )}
          </div>

          {/* Payment & Security Ledger Proof */}
          <div className="info-box bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono text-[11px] space-y-1.5">
            <div className="info-box-title text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 font-sans flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1 inline" />
              <span>PayPal Settlement Ledger</span>
            </div>
            <div className="ledger-row flex justify-between border-b border-slate-200/60 pb-1">
              <span className="ledger-label font-sans text-slate-500">Method:</span>
              <span className="ledger-val font-sans text-slate-900">{paymentMethodLabel}</span>
            </div>
            <div className="ledger-row flex justify-between border-b border-slate-200/60 pb-1">
              <span className="ledger-label font-sans text-slate-500">PayPal Order ID:</span>
              <span className="ledger-val text-blue-700">{payment?.paypalOrderId || "MOCK-SANDBOX-ORD"}</span>
            </div>
            <div className="ledger-row flex justify-between border-b border-slate-200/60 pb-1">
              <span className="ledger-label font-sans text-slate-500">Capture / Auth ID:</span>
              <span className="ledger-val text-emerald-700">{payment?.paypalCaptureId || "CAPTURE-VERIFIED-100"}</span>
            </div>
            <div className="ledger-row flex justify-between border-b border-slate-200/60 pb-1">
              <span className="ledger-label font-sans text-slate-500">Payer Account:</span>
              <span className="ledger-val text-slate-700 truncate max-w-[170px]">{payment?.payerEmail || order.customerEmail}</span>
            </div>
            <div className="ledger-row flex justify-between">
              <span className="ledger-label font-sans text-slate-500">Simility Risk Score:</span>
              <span className="ledger-val font-sans text-emerald-700">6/100 (Low Risk • Approved)</span>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="table-wrap mb-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-300">
                <th className="col-num py-2.5 px-3 text-center w-10">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="col-qty py-2.5 px-3 text-center w-16">Qty</th>
                <th className="col-rate py-2.5 px-3 text-right w-28">Unit Rate</th>
                <th className="col-total py-2.5 px-3 text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td className="col-num py-3 px-3 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <div className="item-title font-bold text-slate-900">
                      {item.productName}
                    </div>
                    <div className="item-sku text-[10px] text-slate-400 font-mono mt-0.5">
                      SKU: {item.productId?.slice(0, 16) || "PAYPILOT-PROD"}
                    </div>
                  </td>
                  <td className="col-qty py-3 px-3 text-center font-bold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="col-rate py-3 px-3 text-right text-slate-700 font-mono">
                    {formatPrice(item.unitPrice)}
                  </td>
                  <td className="col-total py-3 px-3 text-right font-black text-slate-900 font-mono">
                    {formatPrice(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Terms */}
        <div className="summary-wrap flex flex-col sm:flex-row justify-between items-start gap-6 mb-6 pt-2 border-t border-slate-200">
          <div className="terms-box sm:max-w-md text-xs text-slate-600 space-y-1.5">
            <h5 className="terms-title font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
              Customer Guarantee &amp; Return Terms
            </h5>
            <p className="text-[11px] leading-relaxed">
              All items are covered under PayPilot 30-day money-back guarantee. If you require warranty support or exchanges, present this invoice reference number to customer service.
            </p>
            <p className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
              ✓ Server-verified authoritative transaction authorized via PayPal Platform API.
            </p>
          </div>

          <div className="totals-box w-full sm:w-72 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="total-line flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-slate-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="total-line flex justify-between text-slate-600">
              <span>Estimated Sales Tax (8%):</span>
              <span className="font-mono font-bold text-slate-900">{formatPrice(order.tax)}</span>
            </div>
            <div className="total-line flex justify-between text-slate-600">
              <span>Shipping &amp; Handling:</span>
              <span className="font-mono font-bold text-emerald-700">
                {order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="total-line-strong border-t-2 border-slate-900 pt-2.5 flex justify-between items-baseline">
              <span className="grand-total-label font-black text-slate-950 text-xs uppercase">Total Paid:</span>
              <span className="grand-total-val text-xl font-black text-[#003087] font-mono">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Barcode & Official Verification Seal */}
        <div className="footer-stamp border-t-2 border-dashed border-slate-300 pt-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="barcode-box space-y-1 text-center sm:text-left">
            <div className="barcode-visual flex items-center space-x-1 justify-center sm:justify-start h-6">
              {[4, 2, 5, 2, 7, 3, 4, 2, 6, 3, 2, 5, 4, 7, 2, 5, 3, 6, 2, 4, 5, 3, 7, 2].map(
                (w, i) => (
                  <div
                    key={i}
                    className="b-bar bg-slate-900 h-6"
                    style={{ width: `${w}px` }}
                  />
                )
              )}
            </div>
            <p className="font-mono font-bold text-[10px] text-slate-800 tracking-wider text-center sm:text-left">
              {order.orderNumber}
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <div className="stamp-badge border border-blue-600 text-blue-700 bg-blue-50/50 px-2.5 py-1 rounded-md font-extrabold text-[10px] uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 inline mr-1" />
              <span>Verified Merchant Settlement</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              Computer Generated Tax Invoice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
