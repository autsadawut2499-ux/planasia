import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

function resolveAuthSecret(): string | undefined {
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || undefined;
}

const DEV_FALLBACK_SECRET = "planasia-dev-only-secret-do-not-use-in-production";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret:
    resolveAuthSecret() ??
    (process.env.NODE_ENV === "development" ? DEV_FALLBACK_SECRET : undefined),
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export function isAuthConfigured(): boolean {
  const hasOAuth = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const hasSecret = Boolean(resolveAuthSecret());
  return hasOAuth && hasSecret;
}

export function resolveAuthSecretForRuntime(): string | undefined {
  return resolveAuthSecret();
}
