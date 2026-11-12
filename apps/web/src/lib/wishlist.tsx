'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  image?: string; // alias
  category?: string;
  rating?: number;
  reviewCount?: number;
  stockQuantity?: number;
  description?: string;
}

// Legacy alias kept for backwards compat
export type WishlistItem = WishlistProduct;

interface WishlistContextValue {
  items: WishlistProduct[];
  /** Add a product; no-op if already present */
  addToWishlist: (product: WishlistProduct) => void;
  /** Remove a product by id */
  removeFromWishlist: (id: string) => void;
  /** Returns true if product is in wishlist */
  isInWishlist: (id: string) => boolean;
  /** Remove all items */
  clearWishlist: () => void;
  // Legacy names kept for backwards compat
  addItem: (product: WishlistProduct) => void;
  removeItem: (id: string) => void;
  toggleItem: (product: WishlistProduct) => void;
  hasItem: (id: string) => boolean;
}

// ---------------------------------------------------------------------------
// Context + Provider
// ---------------------------------------------------------------------------

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

const STORAGE_KEY = 'paypilot_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistProduct[]>([]);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota / SSR errors
    }
  }, [items]);

  // ---------------------------------------------------------------------------
  // Mutators
  // ---------------------------------------------------------------------------

  const addToWishlist = useCallback((product: WishlistProduct) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const isInWishlist = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const clearWishlist = useCallback(() => setItems([]), []);

  // Legacy aliases
  const addItem = addToWishlist;
  const removeItem = removeFromWishlist;
  const hasItem = isInWishlist;

  const toggleItem = useCallback(
    (product: WishlistProduct) => {
      setItems((prev) => {
        if (prev.some((i) => i.id === product.id)) {
          return prev.filter((i) => i.id !== product.id);
        }
        return [...prev, product];
      });
    },
    []
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        addItem,
        removeItem,
        toggleItem,
        hasItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used inside <WishlistProvider>');
  }
  return ctx;
}
