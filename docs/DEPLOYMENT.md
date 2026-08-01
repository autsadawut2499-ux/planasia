# Deployment (Vercel + GitHub)

## Canonical production

| Item | Value |
|------|--------|
| GitHub | `https://github.com/autsadawut2499-ux/planasia` |
| Default branch | `main` |
| Production URL | `https://planasia.vercel.app` |
| Vercel project | **`planasia`** (keep a single project) |

`vercel.json` configures the ranking cron (`/api/cron/ranking`) once daily (`0 17 * * *` UTC ≈ midnight ICT) — Hobby plans disallow more frequent crons. Framework settings use Next.js defaults and `npm run build`.

## Build command / env gate

`package.json`:

```text
npm run build  →  node scripts/check-production-env.mjs && next build
```

### Env gate modes

| Mode | Behavior |
|------|----------|
| Default production | **Warn** if required keys are missing — build still succeeds (bootstrap). Hard-fails `ALLOW_MOCK_PAYMENTS=true` and `ADMIN_PIN=501499`. |
| `STRICT_PRODUCTION_ENV=1` | Missing required keys **fail** the build (use after all secrets are in Vercel). |
| `SKIP_PRODUCTION_ENV_CHECK=1` | Skip entirely (local only — do not set on Vercel). |

A failed build does **not** update production — the previous Ready deployment stays aliased.

Locally: `npm run check:env` (soft-warns unless `CI_PRODUCTION_ENV_CHECK=1`).

### Required production variables

See the top of [`.env.example`](../.env.example). For a full go-live set:

- Auth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Site: `NEXT_PUBLIC_SITE_URL`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Ops: `ADMIN_PIN` (not `501499`), `CRON_SECRET`

Recommended: `GEMINI_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`.

**Bootstrap flow:** Deploy with whatever secrets you already have → confirm the site is online → add remaining live keys in Vercel → Redeploy → optionally set `STRICT_PRODUCTION_ENV=1`.

## Dual-project pitfall

This repo has previously been linked to **two** Vercel projects (`planasia` and `planasia-n359`). That causes:

- Duplicate GitHub commit statuses (“Vercel – planasia” and “Vercel – planasia-n359”)
- Confusion about which deployment is “live”
- Stale secondary project URLs that look like an overlapping old site

**Action:** keep only `planasia` connected to GitHub production. Disconnect or delete unused projects.

## Git history rewrite

If `main` is force-pushed (orphan / reset history), old deployment SHAs disappear from the new history. Vercel may still serve a Ready production build cloned from an **old SHA**. Always verify the deployment log line:

```text
Cloning github.com/.../planasia (Branch: main, Commit: <sha>)
```

`<sha>` must match `git rev-parse origin/main`.

## Verifying a release

1. GitHub → commit status for the tip of `main` should be success (not “Deployment failed”).
2. Vercel → Deployments → latest **Production / Ready** → confirm commit SHA.
3. Hit `https://planasia.vercel.app` with cache bypass and check the document title / a known new UI string (homepage title is Thai concept-house copy in current `layout.tsx`).
4. Optional headers: `x-vercel-id`, `x-vercel-cache` (HIT alone is fine after a good deploy; wrong SHA is not a cache issue).

## Redeploy checklist

1. Fix any missing Production env vars in the Vercel project.
2. Redeploy from the Git commit on `main` (Dashboard → Redeploy, or empty commit / push).
3. Confirm only one project receives the production alias `planasia.vercel.app`.
4. Register Stripe webhook to `https://YOUR_DOMAIN/api/webhooks/stripe` if not already.

## Related

- Soft-launch security / payouts: [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md)
- Market / currency behavior: [`src/lib/market/config.ts`](../src/lib/market/config.ts), [`src/lib/currency.ts`](../src/lib/currency.ts)
