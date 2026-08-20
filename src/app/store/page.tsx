import type { Metadata } from "next";
import { Suspense } from "react";
import { buildStoreIndexMetadata } from "@/lib/seo/metadata";
import { getListings } from "@/lib/store/db";
import StorePageClient from "./StorePageClient";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * ISR catalogue: cached HTML with on-demand bust via revalidateStoreSurfaces.
 * Filter query strings get their own canonical so sitemap category URLs are not
 * consolidated away as duplicates of /store.
 */
export const revalidate = 300;

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  return buildStoreIndexMetadata({
    style: firstParam(sp.style),
    collection: firstParam(sp.collection),
    search: firstParam(sp.search) ?? firstParam(sp.q),
  });
}

export default async function StorePage() {
  // SSR listings so /store paints with real cards (no skeleton flicker).
  const initialListings = await getListings();

  return (
    <Suspense fallback={<div className="page-canvas min-h-screen" />}>
      <StorePageClient initialListings={initialListings} />
    </Suspense>
  );
}
