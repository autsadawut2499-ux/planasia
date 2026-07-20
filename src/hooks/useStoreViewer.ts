"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { viewerHeaders } from "@/lib/user/identity";

const STORAGE_KEY = "planasia-user-id";

export function useBrowserId(): string {
  const [browserId, setBrowserId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setBrowserId(id);
  }, []);

  return browserId;
}

/** Unified viewer identity for Store privacy filtering (browser + OAuth session). */
export function useStoreViewer() {
  const { data: session } = useSession();
  const browserId = useBrowserId();
  const sessionUserId = session?.user?.id ?? null;
  const primaryId = sessionUserId || browserId;

  return {
    browserId,
    sessionUserId,
    primaryId,
    headers: (): HeadersInit =>
      browserId
        ? viewerHeaders({ browserId, sessionUserId })
        : {},
    ready: Boolean(browserId),
  };
}
