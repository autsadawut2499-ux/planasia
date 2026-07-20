import type { Metadata } from "next";
import { Suspense } from "react";
import { buildStoreIndexMetadata } from "@/lib/seo/metadata";
import StorePageClient from "./StorePageClient";

export const metadata: Metadata = buildStoreIndexMetadata();

export default function StorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f6f8]" />}>
      <StorePageClient />
    </Suspense>
  );
}
