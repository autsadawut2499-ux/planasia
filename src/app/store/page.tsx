import type { Metadata } from "next";
import { Suspense } from "react";
import { buildStoreIndexMetadata } from "@/lib/seo/metadata";
import StorePageClient from "./StorePageClient";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * SSR catalogue: the full listing payload is too large for static prerendering.
 * StorePageClient fetches the catalogue client-side to keep the initial HTML lean.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  return buildStoreIndexMetadata({
    style: firstParam(sp.style) ?? firstParam(sp.collection),
    search: firstParam(sp.search) ?? firstParam(sp.q),
  });
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="page-canvas min-h-screen" />}>
      <StorePageClient />
    </Suspense>
  );
}
