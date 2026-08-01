"use client";

import { useCallback } from "react";
import { useStoreViewer } from "@/hooks/useStoreViewer";

export type TrackableEvent = "view" | "cart" | "wishlist" | "purchase" | "chat";

/**
 * Fire-and-forget behavioural signal recorder feeding the recommendation
 * engine. Safe to call from anywhere (context-free); silently no-ops until the
 * viewer identity is ready and never throws into the render path.
 */
export function useInteractionTracker() {
  const viewer = useStoreViewer();

  const track = useCallback(
    (listingId: string, eventType: TrackableEvent, metadata?: Record<string, unknown>) => {
      if (!listingId || !viewer.ready) return;
      try {
        void fetch("/api/interactions", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...viewer.headers() },
          body: JSON.stringify({ listingId, eventType, metadata }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        /* never break the UI over analytics */
      }
    },
    [viewer],
  );

  return { track, ready: viewer.ready };
}
