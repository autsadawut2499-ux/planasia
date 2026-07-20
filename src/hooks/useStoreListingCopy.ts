"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { getLocalizedListing } from "@/lib/store/listing-display";
import type { StoreListing } from "@/lib/store/db";

const SESSION_PREFIX = "planasia-tr-";

export interface StoreListingCopy {
  name: string;
  description: string;
  area: string;
  translating: boolean;
  aiTranslated: boolean;
}

function sessionCacheKey(listingId: string, locale: string): string {
  return `${SESSION_PREFIX}${listingId}-${locale}`;
}

function readSessionCache(listingId: string, locale: string): StoreListingCopy | null {
  try {
    const raw = sessionStorage.getItem(sessionCacheKey(listingId, locale));
    if (!raw) return null;
    return JSON.parse(raw) as StoreListingCopy;
  } catch {
    return null;
  }
}

function writeSessionCache(listingId: string, locale: string, copy: StoreListingCopy): void {
  try {
    sessionStorage.setItem(sessionCacheKey(listingId, locale), JSON.stringify(copy));
  } catch {
    /* ignore quota */
  }
}

/**
 * Listing name/description for Store UI — template localization first,
 * then optional AI / Google translation via `/api/translate`.
 */
export function useStoreListingCopy(listing: StoreListing): StoreListingCopy {
  const { locale } = useApp();
  const base = useMemo(() => getLocalizedListing(listing, locale), [listing, locale]);

  const [state, setState] = useState<StoreListingCopy>(() => {
    const cached = readSessionCache(listing.id, locale);
    if (cached) return { ...cached, translating: false };
    return { ...base, translating: false, aiTranslated: false };
  });

  useEffect(() => {
    const cached = readSessionCache(listing.id, locale);
    if (cached) {
      setState({ ...cached, translating: false });
      return;
    }

    setState({ ...base, translating: true, aiTranslated: false });

    const controller = new AbortController();

    void fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: [base.name, base.description, base.area],
        targetLocale: locale,
      }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data: { translations?: string[]; provider?: string }) => {
        const translated =
          data.translations?.length === 3
            ? {
                name: data.translations[0],
                description: data.translations[1],
                area: data.translations[2],
              }
            : base;

        const aiTranslated =
          data.provider === "google" ||
          data.provider === "gemini" ||
          data.provider === "cache";

        const copy: StoreListingCopy = {
          ...translated,
          translating: false,
          aiTranslated,
        };
        writeSessionCache(listing.id, locale, copy);
        setState(copy);
      })
      .catch(() => {
        setState({ ...base, translating: false, aiTranslated: false });
      });

    return () => controller.abort();
  }, [listing.id, locale, base]);

  return state;
}
