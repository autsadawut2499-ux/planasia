import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Bust Next.js ISR caches so admin create / update / unpublish / delete
 * appears on the public articles listing and detail pages immediately.
 * Keep `revalidate = 1800` on those pages as a backup interval.
 */
export function revalidateArticleSurfaces(opts?: {
  slug?: string;
  previousSlug?: string;
}) {
  try {
    revalidatePath("/articles");
    revalidatePath("/articles", "layout");
    revalidatePath("/sitemap.xml");
    if (opts?.slug) {
      revalidatePath(`/articles/${opts.slug}`);
    }
    if (opts?.previousSlug && opts.previousSlug !== opts.slug) {
      revalidatePath(`/articles/${opts.previousSlug}`);
    }
  } catch {
    // revalidatePath throws outside a Next request context (e.g. some tests).
  }
}
