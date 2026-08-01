"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { createRandomId } from "@/lib/random-id";
import { viewerHeaders } from "@/lib/user/identity";

const STORAGE_KEY = "planasia-user-id";

export function useBrowserId(): string {
  const [browserId, setBrowserId] = useState("");

  useEffect(() => {
    let id: string | null = null;
    try {
      id = localStorage.getItem(STORAGE_KEY);
      if (!id) {
        id = createRandomId();
        localStorage.setItem(STORAGE_KEY, id);
      }
    } catch {
      // Private mode / storage blocked — fall back to an in-memory id so the
      // app still has an identity instead of hanging on `ready === false`.
      id = createRandomId();
    }
    setBrowserId(id);
  }, []);

  return browserId;
}

export interface StoreViewer {
  browserId: string;
  sessionUserId: string | null;
  primaryId: string;
  headers: () => HeadersInit;
  ready: boolean;
}

/**
 * Unified viewer identity for Store privacy filtering (browser + OAuth session).
 * The returned object is memoised on the identity primitives — consumers use it
 * inside useCallback/useEffect deps, so a new object each render would loop.
 */
export function useStoreViewer(): StoreViewer {
  const { data: session } = useSession();
  const browserId = useBrowserId();
  const sessionUserId = session?.user?.id ?? null;

  const headers = useCallback(
    (): HeadersInit => (browserId ? viewerHeaders({ browserId, sessionUserId }) : {}),
    [browserId, sessionUserId],
  );

  return useMemo(
    () => ({
      browserId,
      sessionUserId,
      primaryId: sessionUserId || browserId,
      headers,
      ready: Boolean(browserId),
    }),
    [browserId, sessionUserId, headers],
  );
}
