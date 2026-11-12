'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Heart,
  HeartOff,
  ShoppingCart,
  X,
  Star,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Share2,
  Check,
  RefreshCw,
  PackageX,
  Sparkles,
  ShieldCheck,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { useWishlist, WishlistProduct } from '../../lib/wishlist';
import { useCurrency } from '../../lib/currency';
import { useToast } from '../../lib/toast';
import { fetchApi } from '../../lib/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stockLabel(qty?: number): { label: string; color: string } {
  if (qty === undefined || qty === null) return { label: 'Unknown', color: 'text-slate-500 bg-slate-800' };
  if (qty === 0) return { label: 'Out of Stock', color: 'text-rose-400 bg-rose-950/60 border-rose-800/60' };
  if (qty <= 5) return { label: `Only ${qty} left`, color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' };
  return { label: 'In Stock', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' };
}

function StarRating({ rating }: { rating?: number }) {
  const r = rating ?? 0;
  return (
    <span className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.round(r) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
        />
      ))}
      {rating !== undefined && (
        <span className="text-[10px] text-slate-400 ml-1 font-semibold">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Product Card
// ---------------------------------------------------------------------------

interface CardProps {
  product: WishlistProduct;
  onRemove: (id: string) => void;
  onMoveToCart: (product: WishlistProduct) => Promise<void>;
}

function WishlistCard({ product, onRemove, onMoveToCart }: CardProps) {
  const { formatPrice } = useCurrency();
  const [moving, setMoving] = useState(false);
  const [moved, setMoved] = useState(false);
  const stock = stockLabel(product.stockQuantity);
  const imgSrc = product.imageUrl ?? product.image ?? '';
  const isOos = (product.stockQuantity ?? 1) === 0;

  const handleMove = async () => {
    if (isOos) return;
    setMoving(true);
    try {
      await onMoveToCart(product);
      setMoved(true);
      setTimeout(() => setMoved(false), 2500);
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="group relative bg-slate-900/70 rounded-3xl border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 hover:shadow-slate-900/60 transition-all duration-300 flex flex-col">
      {/* Remove button */}
      <button
        onClick={() => onRemove(product.id)}
        title="Remove from wishlist"
        className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-slate-950/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-500/60 opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Stock badge */}
      <span
        className={`absolute top-3 left-3 z-10 text-[10px] font-bold px-2.5 py-0.5 rounded-xl border ${stock.color}`}
      >
        {stock.label}
      </span>

      {/* Image */}
      <div className="relative h-52 bg-slate-950 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOos ? 'opacity-40 grayscale' : 'opacity-90'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700">
            <PackageX className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 space-y-3">
        {product.category && (
          <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
            {product.category}
          </span>
        )}

        <h3 className="font-extrabold text-white text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>

        <StarRating rating={product.rating} />

        {product.description && (
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-auto">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block tracking-wider">
              Price
            </span>
            <span className="text-xl font-black text-white">{formatPrice(product.price)}</span>
          </div>

          <button
            onClick={handleMove}
            disabled={moving || isOos}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md disabled:cursor-not-allowed ${
              isOos
                ? 'bg-slate-800 text-slate-500 opacity-60'
                : moved
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white shadow-brand-500/20 hover:scale-105 active:scale-95'
            }`}
          >
            {moving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Moving…</span>
              </>
            ) : moved ? (
              <>
                <CheckCheck className="w-3.5 h-3.5" />
                <span>In Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{isOos ? 'Out of Stock' : 'Move to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="bg-slate-900/80 rounded-3xl p-16 text-center border border-slate-800 shadow-xl space-y-5 max-w-xl mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto">
        <Heart className="w-9 h-9 text-rose-400/70" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-extrabold text-lg text-white">Your wishlist is empty</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
          Save products you love to your wishlist and come back to them any time — or move them straight to cart.
        </p>
      </div>
      <Link
        href="/products"
        className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-extrabold text-xs px-7 py-3.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        <span>Browse Products</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary Sidebar
// ---------------------------------------------------------------------------

interface SidebarProps {
  items: WishlistProduct[];
  onClear: () => void;
  onShare: () => void;
  sharing: boolean;
  shared: boolean;
}

function WishlistSidebar({ items, onClear, onShare, sharing, shared }: SidebarProps) {
  const { formatPrice } = useCurrency();
  const totalValue = items.reduce((sum, i) => sum + i.price, 0);
  const inStock = items.filter((i) => (i.stockQuantity ?? 1) > 0).length;

  return (
    <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl h-fit space-y-6 sticky top-24">
      {/* Header */}
      <div>
        <h2 className="font-extrabold text-white text-base flex items-center space-x-2">
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
          <span>Wishlist Summary</span>
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">Items saved for later</p>
      </div>

      {/* Stats */}
      <div className="space-y-3 text-sm border-t border-slate-800 pt-4">
        <div className="flex justify-between text-slate-400 text-xs">
          <span>Total Items</span>
          <span className="font-bold text-white">{items.length}</span>
        </div>
        <div className="flex justify-between text-slate-400 text-xs">
          <span>In Stock</span>
          <span className="font-bold text-emerald-400">{inStock}</span>
        </div>
        {inStock < items.length && (
          <div className="flex justify-between text-slate-400 text-xs">
            <span>Out of Stock</span>
            <span className="font-bold text-rose-400">{items.length - inStock}</span>
          </div>
        )}
        <div className="flex justify-between pt-3 border-t border-slate-800 text-base font-black text-white">
          <span>Total Value</span>
          <span className="text-cyan-400">{formatPrice(totalValue)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 border-t border-slate-800 pt-4">
        <button
          onClick={onShare}
          className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
        >
          {shared ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Link Copied!</span>
            </>
          ) : sharing ? (
            <>
              <Copy className="w-4 h-4 animate-pulse" />
              <span>Copying…</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share Wishlist</span>
            </>
          )}
        </button>

        <button
          onClick={onClear}
          className="w-full flex items-center justify-center space-x-2 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 hover:border-rose-700 text-rose-400 font-bold text-xs py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
        >
          <HeartOff className="w-4 h-4" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Wishlist persisted locally</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { toast } = useToast();
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  // Share wishlist — copies current URL to clipboard
  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setShared(true);
      toast('Wishlist link copied to clipboard!', 'success');
      setTimeout(() => setShared(false), 3000);
    } catch {
      toast('Could not copy link — please copy the URL manually.', 'error');
    } finally {
      setSharing(false);
    }
  }, [toast]);

  // Clear with confirmation toast
  const handleClearAll = useCallback(() => {
    if (items.length === 0) return;
    clearWishlist();
    toast('Wishlist cleared', 'info');
  }, [items.length, clearWishlist, toast]);

  // Remove single item
  const handleRemove = useCallback(
    (id: string) => {
      removeFromWishlist(id);
      toast('Removed from wishlist', 'info');
    },
    [removeFromWishlist, toast]
  );

  // Move to cart via API, then remove from wishlist on success
  const handleMoveToCart = useCallback(
    async (product: WishlistProduct) => {
      try {
        await fetchApi('/api/cart/items', {
          method: 'POST',
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });
        removeFromWishlist(product.id);
        toast(`"${product.name.split(' ').slice(0, 3).join(' ')}…" moved to cart!`, 'success');
      } catch (err: any) {
        toast('Could not add to cart: ' + (err?.message ?? 'Unknown error'), 'error');
        throw err; // re-throw so card can reset loading state
      }
    },
    [removeFromWishlist, toast]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-black text-white tracking-tight">My Wishlist</h1>
              {items.length > 0 && (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-rose-600 to-pink-600 text-white text-xs font-black shadow-lg shadow-rose-600/30">
                  {items.length}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {items.length === 0
                ? 'Start saving products you love'
                : `${items.length} saved item${items.length !== 1 ? 's' : ''} · move to cart when you're ready`}
            </p>
          </div>
        </div>

        <Link
          href="/products"
          className="text-xs sm:text-sm text-cyan-400 font-bold flex items-center hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Continue Shopping
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Content */}
      {/* ------------------------------------------------------------------ */}
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* ---- Grid ---- */}
          <div className="lg:col-span-3">
            {/* Mobile toolbar */}
            <div className="flex items-center justify-between mb-5 lg:hidden">
              <span className="text-xs text-slate-400 font-semibold">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-all"
                >
                  {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{shared ? 'Copied!' : 'Share'}</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center space-x-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 px-3 py-2 rounded-xl transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {items.map((product) => (
                <WishlistCard
                  key={product.id}
                  product={product}
                  onRemove={handleRemove}
                  onMoveToCart={handleMoveToCart}
                />
              ))}
            </div>
          </div>

          {/* ---- Sidebar (desktop only) ---- */}
          <div className="hidden lg:block lg:col-span-1">
            <WishlistSidebar
              items={items}
              onClear={handleClearAll}
              onShare={handleShare}
              sharing={sharing}
              shared={shared}
            />
          </div>
        </div>
      )}
    </div>
  );
}
