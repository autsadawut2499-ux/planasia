import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  getAdminEmailsFromEnv,
  isDevAdminLoginEnabled,
  isDevAllowAnyAdmin,
  resolveAdminRole,
} from "@/lib/admin/roles";
import { getAdminPin, verifyAdminPin } from "@/lib/admin/pin";

export { getAdminPin, verifyAdminPin, DEFAULT_ADMIN_PIN } from "@/lib/admin/pin";

function resolveAuthSecret(): string | undefined {
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || undefined;
}

/** Development-only JWT secret — never used when NODE_ENV=production. */
const DEV_FALLBACK_SECRET = "planasia-dev-only-secret-do-not-use-in-production";

function adminPinIdentityEmail(): string {
  const emails = getAdminEmailsFromEnv();
  return emails[0] ?? "admin@planasia.local";
}

function buildProviders() {
  const providers: NextAuthOptions["providers"] = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    );
  }

  // Primary admin access: 6-digit PIN (default 501499, override via ADMIN_PIN).
  providers.push(
    CredentialsProvider({
      id: "admin-pin",
      name: "Admin PIN",
      credentials: {
        pin: { label: "PIN", type: "password", placeholder: "6-digit PIN" },
      },
      async authorize(credentials) {
        const pin = String(credentials?.pin ?? "").trim();
        if (!verifyAdminPin(pin)) return null;
        const email = adminPinIdentityEmail();
        return {
          id: `admin-pin:${email}`,
          email,
          name: "Planasia Admin",
        };
      },
    }),
  );

  // Optional local-only email login — disabled unless ADMIN_DEV_LOGIN=true in development.
  if (isDevAdminLoginEnabled()) {
    providers.push(
      CredentialsProvider({
        id: "dev-admin",
        name: "Dev Admin",
        credentials: {
          email: { label: "Admin Email", type: "email", placeholder: "you@example.com" },
        },
        async authorize(credentials) {
          const email = credentials?.email?.trim().toLowerCase();
          if (!email) return null;
          const allowed = getAdminEmailsFromEnv();
          if (!isDevAllowAnyAdmin() && !allowed.includes(email)) return null;
          const role = await resolveAdminRole(email);
          if (!role) return null;
          return { id: email, email, name: "Dev Admin" };
        },
      }),
    );
  }

  return providers;
}

export const authOptions: NextAuthOptions = {
  providers: buildProviders(),
  secret:
    resolveAuthSecret() ??
    (process.env.NODE_ENV === "development" ? DEV_FALLBACK_SECRET : undefined),
  session: { strategy: "jwt" },
  pages: {
    // User Google sign-in stays on-site; admin uses /admin/login with PIN.
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      if (account?.provider === "google") {
        // Persist buyer account for checkout identity + re-downloads.
        try {
          const { upsertCustomerFromGoogle } = await import(
            "@/lib/supabase/customers"
          );
          const googleSub =
            account.providerAccountId?.trim() ||
            user.id?.trim() ||
            user.email;
          await upsertCustomerFromGoogle({
            id: googleSub,
            email: user.email,
            name: user.name,
            image: user.image,
          });
        } catch (err) {
          console.error("[auth] customer upsert failed", err);
        }
        return true;
      }
      if (account?.provider === "admin-pin") return true;
      // Dev provider is only registered when isDevAdminLoginEnabled().
      if (account?.provider === "dev-admin" && isDevAdminLoginEnabled()) return true;
      return false;
    },
    async jwt({ token, user, account }) {
      const email = user?.email ?? token.email;
      if (email) {
        token.email = email;
        if (account?.provider === "admin-pin") {
          token.isAdmin = true;
          token.adminRole = "admin";
          token.sub = user?.id ?? `admin-pin:${email}`;
        } else if (account?.provider === "dev-admin" && isDevAdminLoginEnabled()) {
          const role = await resolveAdminRole(email);
          token.isAdmin = Boolean(role);
          token.adminRole = role;
          token.sub = user?.id ?? email;
        } else if (account?.provider === "google") {
          // Regular Google users are never admins — use the PIN gate at /admin/login.
          token.isAdmin = false;
          token.adminRole = null;
          const googleSub =
            account.providerAccountId?.trim() || user?.id?.trim();
          if (googleSub) token.sub = googleSub;
        } else if (token.isAdmin == null) {
          token.isAdmin = false;
          token.adminRole = null;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = token.email ?? session.user.email;
        session.user.isAdmin = Boolean(token.isAdmin);
        session.user.adminRole = token.adminRole ?? null;
      }
      return session;
    },
  },
};

export function isAuthConfigured(): boolean {
  const hasOAuth = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const hasDevLogin = isDevAdminLoginEnabled();
  const hasPin = /^\d{6}$/.test(getAdminPin());
  const hasSecret = Boolean(
    resolveAuthSecret() ?? (process.env.NODE_ENV === "development" ? DEV_FALLBACK_SECRET : undefined),
  );
  return (hasOAuth || hasDevLogin || hasPin) && hasSecret;
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function resolveAuthSecretForRuntime(): string | undefined {
  return resolveAuthSecret();
}
