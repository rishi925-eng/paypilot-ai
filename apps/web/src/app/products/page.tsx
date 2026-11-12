"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  ShoppingCart,
  Star,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  Eye,
  LayoutGrid,
  List,
  X,
  ChevronDown,
  ChevronUp,
  Bell,
  ZapOff,
  Zap,
  Scale,
  Filter,
  XCircle,
  Badge,
  Package,
  ChevronRight,
  Sparkles,
  ArrowDownUp,
  StarHalf,
} from "lucide-react";
import { fetchApi } from "../../lib/api";
import { useCurrency } from "../../lib/currency";
import { useToast } from "../../lib/toast";

/* ─────────────────────────── types ─────────────────────────── */
interface Attribute {
  name: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  stock?: number;
  inStock: boolean;
  isNew?: boolean;
  attributes?: Attribute[];
}

type SortOption =
  | "featured"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "newest";
type ViewMode = "grid" | "list";
type RatingFilter = "any" | "4" | "4.5";

const CATEGORIES = [
  "All",
  "Audio",
  "Accessories",
  "Monitors",
  "Laptops",
  "Mechanical Keyboards",
  "Travel & Bags",
  "Cameras",
  "Smart Home",
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
  { value: "newest", label: "Newest" },
];

/* ─────────────────────────── helpers ───────────────────────── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = rating >= n;
        const half = !filled && rating >= n - 0.5;
        return (
          <span key={n} className="relative inline-block w-3.5 h-3.5">
            <Star
              className={`w-3.5 h-3.5 absolute inset-0 ${
                filled ? "fill-amber-400 text-amber-400" : "text-slate-700"
              }`}
            />
            {half && (
              <StarHalf className="w-3.5 h-3.5 absolute inset-0 fill-amber-400 text-amber-400" />
            )}
          </span>
        );
      })}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden animate-pulse">
      <div className="h-52 bg-slate-800" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-slate-800 rounded-full w-1/3" />
        <div className="h-4 bg-slate-800 rounded-full w-3/4" />
        <div className="h-3 bg-slate-800 rounded-full w-full" />
        <div className="h-3 bg-slate-800 rounded-full w-5/6" />
        <div className="mt-4 flex justify-between items-center">
          <div className="h-6 bg-slate-800 rounded-full w-1/4" />
          <div className="h-8 bg-slate-800 rounded-xl w-1/3" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Quick-View Modal ──────────────────────── */
function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  addedId,
  formatPrice,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  addedId: string | null;
  formatPrice: (n: number) => string;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
              {product.category}
            </span>
            <h2 className="text-lg font-black text-white mt-2 leading-snug">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors ml-4 mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="relative rounded-2xl overflow-hidden h-64 bg-slate-950">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-red-400 font-black text-lg tracking-widest uppercase">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} />
            <span className="text-xs text-amber-400 font-bold">
              {product.rating}
            </span>
            <span className="text-xs text-slate-500">
              ({product.reviewCount} reviews)
            </span>
            {product.inStock ? (
              <span className="ml-auto text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                In Stock
              </span>
            ) : (
              <span className="ml-auto text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            {product.description}
          </p>

          {product.attributes && product.attributes.length > 0 && (
            <div className="bg-slate-950/70 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Specifications
                </span>
              </div>
              <table className="w-full">
                <tbody>
                  {product.attributes.map((a, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-slate-900/40" : ""}
                    >
                      <td className="px-4 py-2 text-xs text-slate-500 font-medium w-1/3">
                        {a.name}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-200 font-semibold">
                        {a.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between sticky bottom-0 bg-slate-900">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
              Price
            </span>
            <span className="text-2xl font-black text-white">
              {formatPrice(product.price)}
            </span>
          </div>
          {product.inStock ? (
            <button
              onClick={() => onAddToCart(product)}
              className={`px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-all ${
                addedId === product.id
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-md shadow-violet-500/20"
              }`}
            >
              {addedId === product.id ? (
                <>
                  <Check className="w-4 h-4" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>
          ) : (
            <button className="px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
              <Bell className="w-4 h-4" />
              Notify Me
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Comparison Panel ──────────────────────── */
function ComparisonPanel({
  products,
  onRemove,
  onClear,
  formatPrice,
}: {
  products: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
  formatPrice: (n: number) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50">
      <div
        className="flex items-center justify-between p-3 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold text-white">
            Compare ({products.length}/2)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="text-[10px] text-slate-500 hover:text-red-400 transition-colors font-semibold"
          >
            Clear
          </button>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-800 p-3 space-y-3">
          {/* Product thumbnails */}
          <div className="grid grid-cols-2 gap-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="relative bg-slate-800 rounded-xl overflow-hidden"
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-20 object-cover opacity-80"
                />
                <button
                  onClick={() => onRemove(p.id)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="p-1.5">
                  <p className="text-[10px] font-bold text-white truncate">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-cyan-400 font-black">
                    {formatPrice(p.price)}
                  </p>
                </div>
              </div>
            ))}
            {products.length < 2 && (
              <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl h-28 flex items-center justify-center">
                <span className="text-[10px] text-slate-600 text-center font-medium">
                  Select another
                  <br />
                  product
                </span>
              </div>
            )}
          </div>

          {/* Side-by-side specs */}
          {products.length === 2 && (
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Comparison
              </div>
              <div className="divide-y divide-slate-800">
                {/* Price */}
                <div className="grid grid-cols-3 px-3 py-1.5 text-[10px]">
                  <span className="text-slate-500">Price</span>
                  <span
                    className={`font-bold text-center ${
                      products[0].price <= products[1].price
                        ? "text-emerald-400"
                        : "text-white"
                    }`}
                  >
                    {formatPrice(products[0].price)}
                  </span>
                  <span
                    className={`font-bold text-center ${
                      products[1].price <= products[0].price
                        ? "text-emerald-400"
                        : "text-white"
                    }`}
                  >
                    {formatPrice(products[1].price)}
                  </span>
                </div>
                {/* Rating */}
                <div className="grid grid-cols-3 px-3 py-1.5 text-[10px]">
                  <span className="text-slate-500">Rating</span>
                  <span
                    className={`font-bold text-center ${
                      products[0].rating >= products[1].rating
                        ? "text-amber-400"
                        : "text-white"
                    }`}
                  >
                    ★ {products[0].rating}
                  </span>
                  <span
                    className={`font-bold text-center ${
                      products[1].rating >= products[0].rating
                        ? "text-amber-400"
                        : "text-white"
                    }`}
                  >
                    ★ {products[1].rating}
                  </span>
                </div>
                {/* Stock */}
                <div className="grid grid-cols-3 px-3 py-1.5 text-[10px]">
                  <span className="text-slate-500">Stock</span>
                  <span
                    className={`font-bold text-center ${
                      products[0].inStock ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {products[0].inStock ? "Yes" : "No"}
                  </span>
                  <span
                    className={`font-bold text-center ${
                      products[1].inStock ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {products[1].inStock ? "Yes" : "No"}
                  </span>
                </div>
                {/* Shared attributes */}
                {products[0].attributes?.slice(0, 3).map((a, i) => {
                  const b = products[1].attributes?.find(
                    (x) => x.name === a.name
                  );
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-3 px-3 py-1.5 text-[10px]"
                    >
                      <span className="text-slate-500 truncate">{a.name}</span>
                      <span className="font-semibold text-center text-slate-300 truncate">
                        {a.value}
                      </span>
                      <span className="font-semibold text-center text-slate-300 truncate">
                        {b?.value ?? "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Product Card (Grid) ───────────────────── */
function ProductCardGrid({
  product,
  addedId,
  onAddToCart,
  onQuickView,
  onCompare,
  isCompared,
  compareDisabled,
  formatPrice,
}: {
  product: Product;
  addedId: string | null;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onCompare: (p: Product) => void;
  isCompared: boolean;
  compareDisabled: boolean;
  formatPrice: (n: number) => string;
}) {
  return (
    <div
      className={`group bg-slate-900/60 rounded-3xl border overflow-hidden shadow-xl transition-all flex flex-col ${
        isCompared
          ? "border-violet-500 shadow-violet-500/10"
          : "border-slate-800 hover:border-slate-600 hover:shadow-slate-900"
      }`}
    >
      {/* Image */}
      <div className="relative h-52 bg-slate-950 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            !product.inStock ? "opacity-50 grayscale" : "opacity-90 group-hover:opacity-100"
          }`}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="bg-slate-900/80 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-xl text-cyan-300 border border-slate-700">
            {product.category}
          </span>
          {product.isNew && (
            <span className="bg-violet-600/90 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-xl text-white flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> New
            </span>
          )}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/70 text-red-400 text-xs font-black px-4 py-1.5 rounded-xl tracking-widest uppercase border border-red-500/30">
              Out of Stock
            </span>
          </div>
        )}
        {/* Quick view overlay */}
        <button
          onClick={() => onQuickView(product)}
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all bg-black/70 hover:bg-white/20 backdrop-blur-md text-white rounded-xl px-3 py-1.5 text-[10px] font-bold flex items-center gap-1.5 border border-white/10"
        >
          <Eye className="w-3 h-3" /> Quick View
        </button>
        {/* Compare toggle */}
        <button
          onClick={() => onCompare(product)}
          disabled={compareDisabled && !isCompared}
          className={`absolute top-3 right-3 transition-all rounded-xl px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1 border ${
            isCompared
              ? "bg-violet-600 border-violet-500 text-white opacity-100"
              : "opacity-0 group-hover:opacity-100 bg-black/70 border-white/10 text-slate-300 hover:border-violet-500 hover:text-violet-300 disabled:opacity-30 disabled:cursor-not-allowed"
          }`}
        >
          <Scale className="w-2.5 h-2.5" />
          {isCompared ? "Added" : "Compare"}
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <StarRating rating={product.rating} />
          <span className="text-[10px] text-amber-400 font-bold">
            {product.rating}
          </span>
          <span className="text-[10px] text-slate-600">
            ({product.reviewCount})
          </span>
        </div>
        <h3 className="font-extrabold text-white text-sm leading-snug">
          {product.name}
        </h3>
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Specs */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="pt-1 space-y-1 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
            {product.attributes.slice(0, 3).map((a, idx) => (
              <div key={idx} className="text-[10px] flex justify-between gap-2">
                <span className="text-slate-500">{a.name}</span>
                <span className="font-semibold text-slate-300 text-right">
                  {a.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
              Price
            </span>
            <span className="text-lg font-black text-white">
              {formatPrice(product.price)}
            </span>
          </div>
          {product.inStock ? (
            <button
              onClick={() => onAddToCart(product)}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all whitespace-nowrap ${
                addedId === product.id
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-md shadow-violet-500/20"
              }`}
            >
              {addedId === product.id ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add to Cart
                </>
              )}
            </button>
          ) : (
            <button className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all whitespace-nowrap">
              <Bell className="w-3.5 h-3.5" />
              Notify Me
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Product Card (List) ───────────────────── */
function ProductCardList({
  product,
  addedId,
  onAddToCart,
  onQuickView,
  onCompare,
  isCompared,
  compareDisabled,
  formatPrice,
}: {
  product: Product;
  addedId: string | null;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onCompare: (p: Product) => void;
  isCompared: boolean;
  compareDisabled: boolean;
  formatPrice: (n: number) => string;
}) {
  return (
    <div
      className={`group bg-slate-900/60 rounded-2xl border overflow-hidden shadow-xl transition-all flex flex-col sm:flex-row ${
        isCompared
          ? "border-violet-500 shadow-violet-500/10"
          : "border-slate-800 hover:border-slate-600"
      }`}
    >
      {/* Image */}
      <div className="relative w-full sm:w-48 h-40 sm:h-auto bg-slate-950 flex-shrink-0 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            !product.inStock ? "opacity-50 grayscale" : "opacity-90 group-hover:opacity-100"
          }`}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="bg-slate-900/80 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-lg text-cyan-300 border border-slate-700">
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={product.rating} />
              <span className="text-[10px] text-amber-400 font-bold">
                {product.rating}
              </span>
              <span className="text-[10px] text-slate-600">
                ({product.reviewCount} reviews)
              </span>
            </div>
            <h3 className="font-extrabold text-white text-sm leading-snug">
              {product.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                In Stock
              </span>
            ) : (
              <span className="text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {/* Specs inline */}
        {product.attributes && product.attributes.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {product.attributes.slice(0, 4).map((a, i) => (
              <span key={i} className="text-[10px] text-slate-500">
                {a.name}:{" "}
                <span className="text-slate-300 font-semibold">{a.value}</span>
              </span>
            ))}
          </div>
        )}

        {/* Bottom row */}
        <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xl font-black text-white">
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuickView(product)}
              className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            >
              <Eye className="w-3.5 h-3.5" /> Quick View
            </button>
            <button
              onClick={() => onCompare(product)}
              disabled={compareDisabled && !isCompared}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isCompared
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:border-violet-500 hover:text-violet-300 disabled:opacity-30 disabled:cursor-not-allowed"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              {isCompared ? "Compared" : "Compare"}
            </button>
            {product.inStock ? (
              <button
                onClick={() => onAddToCart(product)}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  addedId === product.id
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-md shadow-violet-500/20"
                }`}
              >
                {addedId === product.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                  </>
                )}
              </button>
            ) : (
              <button className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">
                <Bell className="w-3.5 h-3.5" /> Notify Me
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════════════ */
export default function ProductsPage() {
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  /* ── state ── */
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("any");
  const [addedId, setAddedId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<Product[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── fetch ── */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== "All") params.set("category", category);
      if (search) params.set("q", search);
      params.set("minPrice", String(priceRange[0]));
      params.set("maxPrice", String(priceRange[1]));
      const res = await fetchApi(`/api/products?${params.toString()}`);
      if (res?.data) {
        const normalized = res.data.map((p: any) => ({
          ...p,
          stock: p.stock ?? 0,
          inStock: typeof p.inStock === "boolean" ? p.inStock : (p.stock !== undefined ? p.stock > 0 : true),
        }));
        setProducts(normalized);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [category, search, priceRange]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /* ── derived / sorted list ── */
  const filteredProducts = React.useMemo(() => {
    let list = [...products];

    if (inStockOnly) list = list.filter((p) => p.inStock);
    if (ratingFilter === "4") list = list.filter((p) => p.rating >= 4);
    if (ratingFilter === "4.5") list = list.filter((p) => p.rating >= 4.5);

    switch (sortBy) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list = list.filter((p) => p.isNew).concat(list.filter((p) => !p.isNew));
        break;
      default:
        break;
    }
    return list;
  }, [products, inStockOnly, ratingFilter, sortBy]);

  /* ── active filters for badges ── */
  const activeFilters: { label: string; clear: () => void }[] = [];
  if (category !== "All")
    activeFilters.push({ label: category, clear: () => setCategory("All") });
  if (inStockOnly)
    activeFilters.push({ label: "In Stock", clear: () => setInStockOnly(false) });
  if (ratingFilter !== "any")
    activeFilters.push({
      label: `${ratingFilter}★+`,
      clear: () => setRatingFilter("any"),
    });
  if (sortBy !== "featured")
    activeFilters.push({
      label: SORT_OPTIONS.find((s) => s.value === sortBy)!.label,
      clear: () => setSortBy("featured"),
    });
  if (priceRange[0] > 0 || priceRange[1] < 2000)
    activeFilters.push({
      label: `$${priceRange[0]}–$${priceRange[1]}`,
      clear: () => setPriceRange([0, 2000]),
    });

  const clearAllFilters = () => {
    setCategory("All");
    setInStockOnly(false);
    setRatingFilter("any");
    setSortBy("featured");
    setPriceRange([0, 2000]);
    setSearch("");
    setSearchInput("");
  };

  /* ── cart ── */
  const handleAddToCart = async (product: Product) => {
    try {
      await fetchApi("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      setAddedId(product.id);
      toast(`Added "${product.name.split(" ")[0]}…" to cart`, "success");
      setTimeout(() => setAddedId(null), 2000);
    } catch (err: any) {
      toast("Could not add to cart: " + err.message, "error");
    }
  };

  /* ── compare ── */
  const toggleCompare = (product: Product) => {
    setSelectedForCompare((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 2) {
        toast("You can only compare 2 products at a time.", "error");
        return prev;
      }
      return [...prev, product];
    });
  };

  /* ── search trigger ── */
  const triggerSearch = () => setSearch(searchInput);

  /* ── sidebar section ── */
  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">
          Category
        </h3>
        <div className="space-y-1.5">
          {CATEGORIES.map((c) => (
            <label
              key={c}
              className={`flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2 transition-all ${
                category === c
                  ? "bg-violet-600/20 border border-violet-500/30"
                  : "hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  category === c
                    ? "border-violet-500 bg-violet-500"
                    : "border-slate-600"
                }`}
              >
                {category === c && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  category === c ? "text-violet-300" : "text-slate-400"
                }`}
                onClick={() => {
                  setCategory(c);
                  setSidebarOpen(false);
                }}
              >
                {c}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800" />

      {/* Price Range */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">
          Price Range
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 mb-1 block">Min</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  max={priceRange[1]}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([
                      Math.min(Number(e.target.value), priceRange[1]),
                      priceRange[1],
                    ])
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-6 pr-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 mb-1 block">Max</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                  $
                </span>
                <input
                  type="number"
                  min={priceRange[0]}
                  max={2000}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([
                      priceRange[0],
                      Math.max(Number(e.target.value), priceRange[0]),
                    ])
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-6 pr-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={2000}
            step={10}
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-[10px] text-slate-600">
            <span>$0</span>
            <span>$2,000</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800" />

      {/* Sort By */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">
          Sort By
        </h3>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2 transition-all ${
                sortBy === opt.value
                  ? "bg-violet-600/20 border border-violet-500/30"
                  : "hover:bg-slate-800/60 border border-transparent"
              }`}
              onClick={() => setSortBy(opt.value)}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  sortBy === opt.value
                    ? "border-violet-500 bg-violet-500"
                    : "border-slate-600"
                }`}
              >
                {sortBy === opt.value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  sortBy === opt.value ? "text-violet-300" : "text-slate-400"
                }`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800" />

      {/* In Stock Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            In Stock Only
          </h3>
          <p className="text-[10px] text-slate-600 mt-0.5">Hide unavailable items</p>
        </div>
        <button
          onClick={() => setInStockOnly((v) => !v)}
          className={`relative w-10 h-5.5 rounded-full transition-all duration-300 flex items-center ${
            inStockOnly ? "bg-violet-600" : "bg-slate-700"
          }`}
          style={{ minWidth: "2.5rem", height: "1.375rem" }}
        >
          <span
            className={`absolute w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
              inStockOnly ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800" />

      {/* Rating Filter */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">
          Minimum Rating
        </h3>
        <div className="space-y-1.5">
          {(
            [
              { value: "any", label: "Any Rating" },
              { value: "4", label: "4★ and above" },
              { value: "4.5", label: "4.5★ and above" },
            ] as { value: RatingFilter; label: string }[]
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2 transition-all ${
                ratingFilter === opt.value
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "hover:bg-slate-800/60 border border-transparent"
              }`}
              onClick={() => setRatingFilter(opt.value)}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  ratingFilter === opt.value
                    ? "border-amber-500 bg-amber-500"
                    : "border-slate-600"
                }`}
              >
                {ratingFilter === opt.value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  ratingFilter === opt.value
                    ? "text-amber-300"
                    : "text-slate-400"
                }`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-3">
          <span>Home</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-300 font-medium">Products</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Product Catalogue
        </h1>
        <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
          Explore developer hardware, studio headphones, mechanical keyboards,
          4K displays and more — all with full specifications.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
            placeholder="Search products, brands, specs…"
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder-slate-600"
          />
        </div>
        <button
          onClick={triggerSearch}
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-bold rounded-2xl transition-all shadow-md shadow-violet-500/20"
        >
          Search
        </button>
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden px-4 py-3 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl hover:border-slate-700 transition-all flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      <div className="flex gap-6">
        {/* ─── Desktop Sidebar ─── */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-6 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-black text-white">Filters</span>
              </div>
              {activeFilters.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] text-red-400 hover:text-red-300 font-semibold transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            <SidebarContent />
          </div>
        </aside>

        {/* ─── Mobile Sidebar Drawer ─── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-black text-white">Filters</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* ─── Main Content ─── */}
        <main className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">
                <span className="text-white font-bold">
                  {filteredProducts.length}
                </span>{" "}
                {filteredProducts.length === 1 ? "result" : "results"}
              </span>
              {activeFilters.map((f, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-[10px] font-bold px-2.5 py-1 rounded-full"
                >
                  {f.label}
                  <button
                    onClick={f.clear}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {activeFilters.length > 1 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] text-red-400 hover:text-red-300 font-semibold transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Grid / List */}
          {loading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                  : "space-y-4"
              }
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-32 text-center">
              <Package className="w-14 h-14 text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-400">
                No products found
              </h3>
              <p className="text-xs text-slate-600 mt-1 mb-5">
                Try adjusting your filters or search query.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map((p) => (
                <ProductCardGrid
                  key={p.id}
                  product={p}
                  addedId={addedId}
                  onAddToCart={handleAddToCart}
                  onQuickView={setQuickViewProduct}
                  onCompare={toggleCompare}
                  isCompared={!!selectedForCompare.find((x) => x.id === p.id)}
                  compareDisabled={selectedForCompare.length >= 2}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((p) => (
                <ProductCardList
                  key={p.id}
                  product={p}
                  addedId={addedId}
                  onAddToCart={handleAddToCart}
                  onQuickView={setQuickViewProduct}
                  onCompare={toggleCompare}
                  isCompared={!!selectedForCompare.find((x) => x.id === p.id)}
                  compareDisabled={selectedForCompare.length >= 2}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          addedId={addedId}
          formatPrice={formatPrice}
        />
      )}

      {/* Comparison Panel */}
      <ComparisonPanel
        products={selectedForCompare}
        onRemove={(id) =>
          setSelectedForCompare((prev) => prev.filter((p) => p.id !== id))
        }
        onClear={() => setSelectedForCompare([])}
        formatPrice={formatPrice}
      />
    </div>
  );
}
