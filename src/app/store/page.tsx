import type { Metadata } from "next";
import { Suspense } from "react";
import { buildStoreIndexMetadata } from "@/lib/seo/metadata";
import { getListings } from "@/lib/store/db";
import StorePageClient from "./StorePageClient";

export const metadata: Metadata = buildStoreIndexMetadata();
/** Always fetch fresh catalogue so vendor uploads appear instantly. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StorePage() {
  // SSR listings so /store paints with real cards (no skeleton flicker).
  const initialListings = await getListings();

  return (
    <Suspense fallback={<div className="page-canvas min-h-screen" />}>
      <StorePageClient initialListings={initialListings} />
    </Suspense>
  );
}
