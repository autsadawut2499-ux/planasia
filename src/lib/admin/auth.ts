import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import type { AdminRole } from "@/lib/admin/roles";
import { resolveAdminRole } from "@/lib/admin/roles";

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

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;

  // PIN gate stamps isAdmin on the JWT — trust that claim so admin works
  // even when ADMIN_EMAILS is empty / email is the synthetic PIN identity.
  if (session.user?.isAdmin) {
    const stamped = session.user.adminRole;
    return {
      email,
      role: stamped === "editor" ? "editor" : "admin",
      name: session.user?.name,
      image: session.user?.image,
    };
  }

  const role = await resolveAdminRole(email);
  if (!role) return null;

  return {
    email,
    role,
    name: session.user?.name,
    image: session.user?.image,
  };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) {
    throw new AdminAuthError("Unauthorized — admin access required");
  }
  return admin;
}

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthError";
  }
}
