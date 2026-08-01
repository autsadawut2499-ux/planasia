/**
 * Fail CI/build when required production env vars are missing.
 * Usage: node scripts/check-production-env.mjs
 * Set SKIP_PRODUCTION_ENV_CHECK=1 to bypass (local only).
 */

const required = [
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "ADMIN_PIN",
  "CRON_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

const DEFAULT_ADMIN_PIN = "501499";

if (process.env.SKIP_PRODUCTION_ENV_CHECK === "1") {
  console.log("[env-check] skipped (SKIP_PRODUCTION_ENV_CHECK=1)");
  process.exit(0);
}

// Hard-fail only on real production deploys (Vercel production) or explicit CI flag.
// Local `next build` sets NODE_ENV=production but should soft-warn, not block.
const isProd =
  process.env.VERCEL_ENV === "production" ||
  process.env.CI_PRODUCTION_ENV_CHECK === "1";

if (!isProd) {
  console.log("[env-check] non-production — soft check only");
}

const missing = required.filter((key) => !String(process.env[key] ?? "").trim());
const mockOn = process.env.ALLOW_MOCK_PAYMENTS === "true";

if (mockOn && isProd) {
  console.error("[env-check] ALLOW_MOCK_PAYMENTS must not be enabled in production");
  process.exit(1);
}

const adminPin = String(process.env.ADMIN_PIN ?? "").trim();
if (isProd && adminPin === DEFAULT_ADMIN_PIN) {
  console.error(
    "[env-check] ADMIN_PIN must not be the example default (501499) in production — set a unique 6-digit PIN",
  );
  process.exit(1);
}

if (missing.length) {
  const msg = `[env-check] missing: ${missing.join(", ")}`;
  if (isProd) {
    console.error(msg);
    process.exit(1);
  }
  console.warn(msg);
  process.exit(0);
}

console.log("[env-check] production env looks complete");
