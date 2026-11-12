"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  StarHalf,
  ShoppingCart,
  Heart,
  ChevronRight,
  Minus,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Truck,
  RotateCcw,
  BadgeCheck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Zap,
  Tag,
  RefreshCw,
} from "lucide-react";
import { fetchApi } from "../../../lib/api";
import { useCurrency } from "../../../lib/currency";
import { useToast } from "../../../lib/toast";

/* ─────────────────────────────────────────── helpers ─── */

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
      {half && <StarHalf className="w-4 h-4 fill-amber-400 text-amber-400" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className="w-4 h-4 text-slate-600" />
      ))}
    </span>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`bg-slate-800 animate-pulse rounded-2xl ${className ?? ""}`} />
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
        <XCircle className="w-3.5 h-3.5" /> Out of Stock
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5" /> Low Stock ({stock} left)
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
      <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
    </span>
  );
}

/* ─────────────────────────────────────────── page ─── */

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { formatPrice, convertPrice, symbol } = useCurrency();
  const { toast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [imgError, setImgError] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [productRes, allRes] = await Promise.all([
        fetchApi(`/api/products/${slug}`),
        fetchApi("/api/products"),
      ]);

      const prod = productRes?.data ?? productRes;
      if (!prod || !prod.id) {
        setNotFound(true);
        return;
      }
      setProduct(prod);

      const all: any[] = allRes?.data ?? allRes ?? [];
      const others = all.filter((p: any) => p.id !== prod.id);
      // Pick 4 random
      const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 4);
      setRelated(shuffled);
    } catch (err: any) {
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        setNotFound(true);
      } else {
        toast("Failed to load product: " + err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const [expressBuying, setExpressBuying] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAddingCart(true);
      await fetchApi("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      toast(`"${product.name}" added to cart!`, "success");
    } catch (err: any) {
      toast("Could not add to cart: " + err.message, "error");
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setExpressBuying(true);
      toast("Initiating 1-Click PayPal Sandbox Express Checkout...", "info");

      const orderRes = await fetchApi("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: "Alex Customer (PayPal Express)",
          customerEmail: "buyer-express@paypilot.io",
          items: [{ productId: product.id, quantity }],
          shippingAddress: {
            addressLine1: "123 Innovation Way",
            city: "San Jose",
            state: "CA",
            postalCode: "95131",
            countryCode: "US",
          },
        }),
      });

      const appOrder = orderRes.data;

      const ppOrderRes = await fetchApi("/api/payments/create-paypal-order", {
        method: "POST",
        body: JSON.stringify({ orderId: appOrder.id }),
      });

      const captureRes = await fetchApi("/api/payments/capture-paypal-order", {
        method: "POST",
        body: JSON.stringify({
          orderId: appOrder.id,
          paypalOrderId: ppOrderRes.data.paypalOrderId,
        }),
      });

      if (captureRes.success) {
        toast("PayPal Captured! Generating Official Tax Invoice...", "success");
        setTimeout(() => {
          router.push(`/orders/${appOrder.id}`);
        }, 600);
      }
    } catch (err: any) {
      toast("Express checkout failed: " + err.message, "error");
    } finally {
      setExpressBuying(false);
    }
  };

  /* ── LOADING SKELETON ── */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* breadcrumb skeleton */}
        <SkeletonBlock className="h-5 w-72" />
        <div className="flex flex-col lg:flex-row gap-10">
          <SkeletonBlock className="w-full lg:w-[60%] h-[480px]" />
          <div className="flex-1 space-y-5">
            <SkeletonBlock className="h-6 w-24" />
            <SkeletonBlock className="h-10 w-3/4" />
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-12 w-48" />
            <SkeletonBlock className="h-8 w-56" />
            <SkeletonBlock className="h-10 w-32" />
            <div className="flex gap-3 pt-4">
              <SkeletonBlock className="h-12 flex-1" />
              <SkeletonBlock className="h-12 flex-1" />
              <SkeletonBlock className="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── 404 ── */
  if (notFound) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-5">
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-black text-white">Product Not Found</h1>
        <p className="text-slate-400 text-sm">
          We couldn&apos;t find a product matching <span className="text-cyan-400 font-mono">"{slug}"</span>.
        </p>
        <Link
          href="/products"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 text-white text-sm font-bold hover:opacity-90 transition"
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  /* ── COMPUTED ── */
  const hasDiscount = true; // Honey discount always shown if available
  const discountedPrice = product.price * 0.8;
  const installment = (convertPrice(product.price) / 4).toFixed(2);
  const stockCount = product.stockCount ?? product.stock ?? 50;

  /* ────────────────────────── MAIN RENDER ────────────────────────── */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center flex-wrap gap-1.5 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link href="/products" className="hover:text-white transition-colors">Products</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-cyan-400 font-semibold">{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-300 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* ── HERO + INFO ── */}
      <div className="flex flex-col lg:flex-row gap-10">

        {/* LEFT – Hero Image (60%) */}
        <div className="w-full lg:w-[60%] relative group">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl aspect-[4/3]">
            {!imgError ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 text-4xl">
                🖼️
              </div>
            )}
            {/* Category overlay badge */}
            <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-[11px] font-bold px-3 py-1.5 rounded-xl text-cyan-300 border border-slate-700 shadow">
              {product.category}
            </span>
            {/* Honey badge overlay */}
            {hasDiscount && (
              <span className="absolute top-4 right-4 bg-amber-500/90 backdrop-blur-sm text-[11px] font-black px-3 py-1.5 rounded-xl text-white shadow-lg flex items-center gap-1">
                <Tag className="w-3 h-3" /> 20% off with HONEY20
              </span>
            )}
          </div>
        </div>

        {/* RIGHT – Info Panel */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Category badge */}
          <div>
            <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 border border-cyan-500/30 px-3 py-1 rounded-lg">
              {product.category}
            </span>
          </div>

          {/* Name */}
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2.5">
            <StarRating rating={product.rating ?? 4.5} />
            <span className="text-amber-400 font-bold text-sm">{product.rating ?? "4.5"}</span>
            <span className="text-slate-500 text-xs">({product.reviewCount ?? 0} reviews)</span>
          </div>

          {/* Price block */}
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              {hasDiscount && (
                <span className="text-slate-500 line-through text-sm block mb-0.5">
                  {formatPrice(product.price)}
                </span>
              )}
              <span className="text-4xl font-black text-white">
                {hasDiscount ? formatPrice(discountedPrice) : formatPrice(product.price)}
              </span>
            </div>
            {hasDiscount && (
              <span className="mb-1 inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30">
                <Tag className="w-3.5 h-3.5" /> 20% off with <span className="font-mono tracking-tight">HONEY20</span>
              </span>
            )}
          </div>

          {/* Stock status */}
          <StockBadge stock={stockCount} />

          {/* PayPal Paidy BNPL */}
          <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
            <Zap className="w-4 h-4 text-[#ffc439] flex-shrink-0" />
            <p className="text-xs text-slate-300 font-medium">
              <span className="text-white font-black">4 payments of {symbol}{installment}</span>
              {" "}with{" "}
              <span className="text-[#ffc439] font-black">PayPal Paidy</span>
              {" "}— <span className="text-emerald-400 font-bold">0% APR</span>
            </p>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Qty</span>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3.5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-5 py-2 text-white font-black text-sm min-w-[3rem] text-center select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3.5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex items-stretch gap-3 pt-1 flex-wrap">
            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={addingCart || stockCount === 0}
              className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-black text-sm shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              {addingCart ? "Adding…" : "Add to Cart"}
            </button>

            {/* 1-Click PayPal Express Buy */}
            <button
              onClick={handleBuyNow}
              disabled={stockCount === 0 || expressBuying}
              className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-[#003087] shadow-lg shadow-amber-400/20 transition-all hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: "#ffc439" }}
            >
              {expressBuying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#003087]" />
                  <span>Settling with PayPal...</span>
                </>
              ) : (
                <>
                  {/* PayPal wordmark */}
                  <svg viewBox="0 0 101 32" className="h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.237 2.842H5.532a.94.94 0 0 0-.928.794L2.04 25.407a.565.565 0 0 0 .555.658h3.426a.94.94 0 0 0 .928-.794l.641-4.065a.94.94 0 0 1 .928-.794h2.184c4.547 0 7.17-2.2 7.854-6.562.309-1.906.012-3.404-.885-4.455-.987-1.155-2.736-1.553-5.434-1.553zm.796 6.466c-.376 2.474-2.267 2.474-4.096 2.474h-1.04l.73-4.62a.565.565 0 0 1 .556-.474h.477c1.244 0 2.418 0 3.023.71.363.424.474 1.054.35 1.91z" fill="#003087"/>
                    <path d="M35.192 9.222h-3.437a.563.563 0 0 0-.556.474l-.143.906-.226-.328c-.703-1.02-2.27-1.362-3.834-1.362-3.588 0-6.652 2.717-7.25 6.525-.31 1.9.13 3.717 1.196 4.982.979 1.163 2.378 1.648 4.042 1.648 2.892 0 4.496-1.858 4.496-1.858l-.144.9a.564.564 0 0 0 .556.658h3.095a.94.94 0 0 0 .928-.794l1.857-11.774a.563.563 0 0 0-.58-.677zm-4.798 6.308c-.312 1.852-1.782 3.095-3.657 3.095-.94 0-1.694-.302-2.176-.875-.48-.568-.66-1.38-.508-2.285.291-1.836 1.783-3.12 3.63-3.12.92 0 1.67.306 2.161.884.493.582.686 1.398.55 2.301z" fill="#003087"/>
                    <path d="M55.13 9.222h-3.453a.94.94 0 0 0-.775.41l-4.474 6.588-1.896-6.33a.94.94 0 0 0-.9-.668h-3.394a.565.565 0 0 0-.535.75l3.572 10.478-3.36 4.742a.564.564 0 0 0 .46.895h3.449a.94.94 0 0 0 .771-.406l10.797-15.582a.562.562 0 0 0-.462-.877z" fill="#003087"/>
                    <path d="M67.503 2.842h-6.704a.94.94 0 0 0-.928.794L57.308 25.407a.565.565 0 0 0 .556.658h3.665a.656.656 0 0 0 .649-.555l.668-4.304a.94.94 0 0 1 .928-.794h2.183c4.547 0 7.17-2.2 7.854-6.562.31-1.906.013-3.404-.884-4.455-.988-1.155-2.736-1.553-5.424-1.553zm.795 6.466c-.376 2.474-2.268 2.474-4.096 2.474h-1.04l.73-4.62a.563.563 0 0 1 .556-.474h.477c1.244 0 2.418 0 3.023.71.364.424.474 1.054.35 1.91z" fill="#009cde"/>
                    <path d="M90.447 9.222H87.01a.563.563 0 0 0-.556.474l-.143.906-.227-.328c-.702-1.02-2.268-1.362-3.833-1.362-3.589 0-6.652 2.717-7.25 6.525-.31 1.9.13 3.717 1.196 4.982.98 1.163 2.378 1.648 4.041 1.648 2.892 0 4.496-1.858 4.496-1.858l-.143.9a.564.564 0 0 0 .555.658h3.096a.94.94 0 0 0 .928-.794l1.856-11.774a.561.561 0 0 0-.58-.677zm-4.799 6.308c-.311 1.852-1.782 3.095-3.656 3.095-.94 0-1.694-.302-2.176-.875-.48-.568-.661-1.38-.508-2.285.29-1.836 1.782-3.12 3.629-3.12.92 0 1.671.306 2.162.884.492.582.685 1.398.549 2.301z" fill="#009cde"/>
                    <path d="M94.895 3.384l-2.633 16.752a.565.565 0 0 0 .556.658h2.963c.524 0 .97-.38 1.051-.898l2.565-16.237a.565.565 0 0 0-.555-.659h-3.392a.568.568 0 0 0-.555.384z" fill="#009cde"/>
                  </svg>
                  <span>Express Buy</span>
                </>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => {
                setWishlisted((w) => !w);
                toast(wishlisted ? "Removed from wishlist" : "Added to wishlist!", "info");
              }}
              className={`w-14 inline-flex items-center justify-center rounded-2xl border transition-all ${
                wishlisted
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40"
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? "fill-rose-400" : ""}`} />
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-slate-400 leading-relaxed border-t border-slate-800 pt-5">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* ── SPECIFICATIONS ACCORDION ── */}
      {product.attributes && product.attributes.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <button
            onClick={() => setSpecsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-5 text-white font-black text-base hover:bg-slate-800/50 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <span className="text-cyan-400">📋</span> Product Specifications
            </span>
            {specsOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {specsOpen && (
            <div className="border-t border-slate-800 overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {product.attributes.map((attr: any, i: number) => (
                    <tr
                      key={i}
                      className={`border-b border-slate-800/60 last:border-0 ${
                        i % 2 === 0 ? "bg-slate-950/30" : ""
                      }`}
                    >
                      <td className="px-6 py-3.5 text-slate-500 font-semibold w-48 whitespace-nowrap">
                        {attr.name}
                      </td>
                      <td className="px-6 py-3.5 text-slate-200 font-medium">
                        {attr.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── PAYPAL FEATURES SECTION ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: <Truck className="w-6 h-6 text-cyan-400" />,
            label: "Free Shipping",
            sub: "On orders over $50",
            border: "border-cyan-500/20",
            glow: "shadow-cyan-500/5",
          },
          {
            icon: <RotateCcw className="w-6 h-6 text-emerald-400" />,
            label: "Easy Returns",
            sub: "30-day return policy",
            border: "border-emerald-500/20",
            glow: "shadow-emerald-500/5",
          },
          {
            icon: <BadgeCheck className="w-6 h-6 text-[#ffc439]" />,
            label: "Verified Seller",
            sub: "PayPal authenticated",
            border: "border-amber-500/20",
            glow: "shadow-amber-500/5",
          },
          {
            icon: <ShieldCheck className="w-6 h-6 text-violet-400" />,
            label: "Simility Protected",
            sub: "AI fraud detection",
            border: "border-violet-500/20",
            glow: "shadow-violet-500/5",
          },
        ].map((f, i) => (
          <div
            key={i}
            className={`bg-slate-900/60 border ${f.border} rounded-2xl p-5 flex flex-col items-center text-center gap-2.5 shadow-lg ${f.glow}`}
          >
            {f.icon}
            <p className="text-white font-bold text-sm">{f.label}</p>
            <p className="text-slate-500 text-xs">{f.sub}</p>
          </div>
        ))}
      </div>

      {/* ── RELATED PRODUCTS ── */}
      {related.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <h2 className="text-xl font-black text-white whitespace-nowrap">You Might Also Like</h2>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden shadow-xl hover:border-slate-600 hover:shadow-brand-500/10 transition-all flex flex-col"
              >
                <div className="relative h-44 bg-slate-950 overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-lg text-cyan-300 border border-slate-700">
                    {p.category}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 text-[11px] font-bold mb-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{p.rating}</span>
                      <span className="text-slate-600 font-normal">({p.reviewCount})</span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                      {p.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-white">{formatPrice(p.price)}</span>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-lg border border-cyan-500/20">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
