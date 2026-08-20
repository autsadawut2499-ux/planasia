import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import type { AdminRole } from "@/lib/admin/roles";

export type { AdminRole } from "@/lib/admin/roles";
export {
  getAdminEmailsFromEnv,
  isAdminEmail,
  isDevAdminLoginEnabled,
  resolveAdminRole,
} from "@/lib/admin/roles";

export interface AdminSession {
  email: string;
  role: AdminRole;
  name?: string | null;
  image?: string | null;
}

/**
 * Admin access is PIN-only (`admin-pin` NextAuth provider).
 * Google / buyer sessions never unlock the dashboard — even if listed in ADMIN_EMAILS.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;

  const email = session.user.email;
  if (!email) return null;

  const stamped = session.user.adminRole;
  return {
    email,
    role: stamped === "editor" ? "editor" : "admin",
    name: session.user.name,
    image: session.user.image,
  };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) {
    throw new AdminAuthError("Unauthorized — admin PIN required");
  }
  return admin;
}

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthError";
  }
}
