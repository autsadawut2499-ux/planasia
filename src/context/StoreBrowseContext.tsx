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

const FAVORITES_KEY = "planasia-store-favorites";

interface StoreBrowseContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  favorites: string[];
  toggleFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (value: boolean) => void;
  favoritesDrawerOpen: boolean;
  setFavoritesDrawerOpen: (open: boolean) => void;
}

const StoreBrowseContext = createContext<StoreBrowseContextValue | null>(null);

export function StoreBrowseProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoritesDrawerOpen, setFavoritesDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(JSON.parse(raw) as string[]);
    } catch {
      setFavorites([]);
    }
  }, []);

  const persistFavorites = useCallback((next: string[]) => {
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }, []);

  const toggleFavorite = useCallback(
    (listingId: string) => {
      persistFavorites(
        favorites.includes(listingId)
          ? favorites.filter((id) => id !== listingId)
          : [...favorites, listingId],
      );
    },
    [favorites, persistFavorites],
  );

  const isFavorite = useCallback(
    (listingId: string) => favorites.includes(listingId),
    [favorites],
  );

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      favorites,
      toggleFavorite,
      isFavorite,
      showFavoritesOnly,
      setShowFavoritesOnly,
      favoritesDrawerOpen,
      setFavoritesDrawerOpen,
    }),
    [
      searchQuery,
      favorites,
      toggleFavorite,
      isFavorite,
      showFavoritesOnly,
      favoritesDrawerOpen,
    ],
  );

  return <StoreBrowseContext.Provider value={value}>{children}</StoreBrowseContext.Provider>;
}

export function useStoreBrowse() {
  const ctx = useContext(StoreBrowseContext);
  if (!ctx) throw new Error("useStoreBrowse must be used within StoreBrowseProvider");
  return ctx;
}

/** Matches listing against search query (name, style, slug, description). */
export function listingMatchesSearch(
  listing: { name: string; style: string; slug: string; description?: string },
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [listing.name, listing.style, listing.slug, listing.description ?? ""]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}
