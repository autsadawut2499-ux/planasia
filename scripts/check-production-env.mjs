/**
 * Production env gate for `npm run build`.
 *
 * Default (bootstrap-friendly):
 *   - Warn when recommended secrets are missing (deploy can still succeed)
 *   - Hard-fail only on unsafe production flags / default ADMIN_PIN
 *
 * When ready for a strict go-live gate, set STRICT_PRODUCTION_ENV=1 on Vercel
 * so missing required keys fail the build.
 *
 * Usage: node scripts/check-production-env.mjs
 * Bypass entirely (local only): SKIP_PRODUCTION_ENV_CHECK=1
 */

const required = [
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_PIN",
  "CRON_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

/** Soft-warn only — slip upload can queue for manual review without this. */
const recommended = [
  "SLIPMATE_API_KEY", // auto slip verify; without it, slips stay awaiting_payment for admin
  "RESEND_API_KEY",
];

if (process.env.SKIP_PRODUCTION_ENV_CHECK === "1") {
  console.log("[env-check] skipped (SKIP_PRODUCTION_ENV_CHECK=1)");
  process.exit(0);
}

// Hard-fail only on real production deploys (Vercel production) or explicit CI flag.
// Local `next build` sets NODE_ENV=production but should soft-warn, not block.
const isProd =
  process.env.VERCEL_ENV === "production" ||
  process.env.CI_PRODUCTION_ENV_CHECK === "1";

/** When "1", missing required keys fail production builds (post-bootstrap). */
const strict = process.env.STRICT_PRODUCTION_ENV === "1";

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
if (isProd && adminPin && adminPin.length !== 6) {
  console.error("[env-check] ADMIN_PIN must be exactly 6 digits when set");
  process.exit(1);
}

const missingRecommended = recommended.filter((key) => {
  if (key === "SLIPMATE_API_KEY") {
    // Accept legacy alias used by getSlipmateApiKey()
    return (
      !String(process.env.SLIPMATE_API_KEY ?? "").trim() &&
      !String(process.env.SLIP_VERIFY_API_KEY ?? "").trim()
    );
  }
  return !String(process.env[key] ?? "").trim();
});

if (missingRecommended.length) {
  console.warn(
    `[env-check] recommended (soft): ${missingRecommended.join(", ")} — see .env.example / docs/DEPLOYMENT.md`,
  );
  if (missingRecommended.includes("SLIPMATE_API_KEY")) {
    console.warn(
      "[env-check] without SLIPMATE_API_KEY, slip uploads queue for manual admin review (no auto-verify)",
    );
  }
}

if (missing.length) {
  const msg = `[env-check] missing: ${missing.join(", ")}`;
  if (isProd && strict) {
    console.error(msg);
    console.error(
      "[env-check] STRICT_PRODUCTION_ENV=1 — fill every required key (see .env.example / docs/DEPLOYMENT.md)",
    );
    process.exit(1);
  }
  if (isProd) {
    console.warn(msg);
    console.warn(
      "[env-check] bootstrap mode — build continues; set secrets in Vercel, then optionally STRICT_PRODUCTION_ENV=1",
    );
  } else {
    console.warn(msg);
  }
  process.exit(0);
}

if (missingRecommended.length && isProd && strict) {
  console.warn(
    "[env-check] STRICT_PRODUCTION_ENV=1 but recommended keys still missing — build OK; set them for full auto features",
  );
}

console.log("[env-check] production env looks complete");
