import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export type AdminRole = "admin" | "editor";

function adminEmailsFromEnv(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmailsFromEnv(): string[] {
  return adminEmailsFromEnv();
}

/**
 * Local emergency email login — never active in production builds.
 * Requires explicit ADMIN_DEV_LOGIN=true (defaults off).
 */
export function isDevAdminLoginEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.VERCEL_ENV === "production") return false;
  return process.env.ADMIN_DEV_LOGIN === "true";
}

/**
 * Local only: any email can sign in as admin when dev login is enabled.
 * Requires explicit ADMIN_DEV_ALLOW_ANY=true (defaults off). Never in production.
 */
export function isDevAllowAnyAdmin(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.VERCEL_ENV === "production") return false;
  return isDevAdminLoginEnabled() && process.env.ADMIN_DEV_ALLOW_ANY === "true";
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  if (isDevAllowAnyAdmin()) return true;
  return adminEmailsFromEnv().includes(email.trim().toLowerCase());
}

export async function resolveAdminRole(email: string): Promise<AdminRole | null> {
  const normalized = email.trim().toLowerCase();
  if (isDevAllowAnyAdmin()) return "admin";
  if (adminEmailsFromEnv().includes(normalized)) return "admin";

  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("admin_users")
      .select("role")
      .eq("email", normalized)
      .maybeSingle();
    if (error || !data) return null;
    return data.role as AdminRole;
  } catch {
    return null;
  }
}
