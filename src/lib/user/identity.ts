import type { NextRequest } from "next/server";

/** Identity signals used to hide a creator's own listings from their Store view. */
export interface ViewerIdentity {
  /** Primary owner key — OAuth user id or browser UUID (X-User-Id). */
  primaryId?: string;
  /** Persistent browser UUID from localStorage (X-Browser-Id). */
  browserId?: string;
  /** OAuth session user id when signed in (X-Session-User-Id). */
  sessionUserId?: string;
  /** Client IP captured at listing creation / store view. */
  ipAddress?: string;
}

export function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") ?? undefined;
}

export function getViewerFromRequest(request: NextRequest): ViewerIdentity {
  return {
    primaryId: request.headers.get("x-user-id") ?? undefined,
    browserId: request.headers.get("x-browser-id") ?? undefined,
    sessionUserId: request.headers.get("x-session-user-id") ?? undefined,
    ipAddress: getClientIp(request),
  };
}

export function resolvePrimaryUserId(sessionUserId?: string | null, browserId?: string): string {
  return sessionUserId || browserId || "";
}

export function viewerHeaders(params: {
  browserId: string;
  sessionUserId?: string | null;
}): HeadersInit {
  const primary = resolvePrimaryUserId(params.sessionUserId, params.browserId);
  const headers: Record<string, string> = {};
  if (primary) headers["X-User-Id"] = primary;
  if (params.browserId) headers["X-Browser-Id"] = params.browserId;
  if (params.sessionUserId) headers["X-Session-User-Id"] = params.sessionUserId;
  return headers;
}
