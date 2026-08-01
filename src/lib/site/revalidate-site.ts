import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Bust Next.js caches for public surfaces that read SiteConfig
 * (hero cover, gallery, mega menu, CMS-driven homepage).
 */
export function revalidateSiteSurfaces() {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/store");
    revalidatePath("/draftsmen");
    revalidatePath("/api/site/config");
  } catch {
    // revalidatePath throws outside a Next request context.
  }
}
