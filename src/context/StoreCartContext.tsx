"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  computeCartTotal,
  listingToCartItem,
  type CartLineItem,
  type UpsellAddonId,
} from "@/lib/store/cart-pricing";
import type { StoreListing } from "@/lib/store/db";

const STORAGE_KEY = "planasia-store-cart";

interface StoreCartContextValue {
  items: CartLineItem[];
  addons: UpsellAddonId[];
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addItem: (listing: StoreListing) => void;
  removeItem: (listingId: string) => void;
  toggleAddon: (addon: UpsellAddonId) => void;
  clearCart: () => void;
  isInCart: (listingId: string) => boolean;
  itemCount: number;
  pricing: ReturnType<typeof computeCartTotal>;
}

const StoreCartContext = createContext<StoreCartContextValue | null>(null);

interface PersistedCart {
  items: CartLineItem[];
  addons: UpsellAddonId[];
}

export function StoreCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [addons, setAddons] = useState<UpsellAddonId[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedCart;
        if (parsed.items) setItems(parsed.items);
        if (parsed.addons) setAddons(parsed.addons);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, addons }));
  }, [items, addons, hydrated]);

  const addItem = useCallback((listing: StoreListing) => {
    setItems((prev) => {
      if (prev.some((i) => i.listingId === listing.id)) return prev;
      return [...prev, listingToCartItem(listing)];
    });
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((listingId: string) => {
    setItems((prev) => prev.filter((i) => i.listingId !== listingId));
  }, []);

  const toggleAddon = useCallback((addon: UpsellAddonId) => {
    setAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon],
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAddons([]);
  }, []);

  const isInCart = useCallback(
    (listingId: string) => items.some((i) => i.listingId === listingId),
    [items],
  );

  const pricing = useMemo(() => computeCartTotal(items, addons), [items, addons]);

  const value = useMemo<StoreCartContextValue>(
    () => ({
      items,
      addons,
      drawerOpen,
      setDrawerOpen,
      addItem,
      removeItem,
      toggleAddon,
      clearCart,
      isInCart,
      itemCount: items.length,
      pricing,
    }),
    [items, addons, drawerOpen, addItem, removeItem, toggleAddon, clearCart, isInCart, pricing],
  );

  return <StoreCartContext.Provider value={value}>{children}</StoreCartContext.Provider>;
}

export function useStoreCart() {
  const ctx = useContext(StoreCartContext);
  if (!ctx) throw new Error("useStoreCart must be used within StoreCartProvider");
  return ctx;
}
