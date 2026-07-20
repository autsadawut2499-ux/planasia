"use client";

import { useEffect, useState } from "react";
export { viewerHeaders } from "@/lib/user/identity";

const STORAGE_KEY = "planasia-user-id";

export function useUserId(): string {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setUserId(id);
  }, []);

  return userId;
}

/** @deprecated Use useStoreViewer().headers() for Store API calls */
export function userHeaders(userId: string, sessionUserId?: string | null): HeadersInit {
  const headers: Record<string, string> = {};
  if (userId) {
    headers["X-User-Id"] = sessionUserId || userId;
    headers["X-Browser-Id"] = userId;
  }
  if (sessionUserId) headers["X-Session-User-Id"] = sessionUserId;
  return headers;
}
