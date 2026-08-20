import "server-only";

import { revalidatePath } from "next/cache";
import { clearPopularListingCache } from "@/lib/ranking/popular";

/**
 * Bust Next.js caches so a vendor upload / admin approve appears on the
 * public store immediately (catalogue + detail + home + sitemap for crawlers).
 */
export function revalidateStoreSurfaces(opts?: { slug?: string; listingId?: string }) {
  try {
    clearPopularListingCache();
    revalidatePath("/store");
    revalidatePath("/store", "layout");
    revalidatePath("/");
    // Keep /sitemap.xml current when plans are published or edited.
    revalidatePath("/sitemap.xml");
    if (opts?.slug) {
      revalidatePath(`/store/${opts.slug}`);
      revalidatePath(`/plans/${opts.slug}`);
    }
    if (opts?.listingId) {
      revalidatePath(`/store/${opts.listingId}`);
    }
  } catch {
    // revalidatePath throws outside a Next request context (e.g. some tests).
  }
}
