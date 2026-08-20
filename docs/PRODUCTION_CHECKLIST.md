# Planasia production checklist

Prioritized build plan for a house-plan marketplace go-live.

Deployment runbook (Vercel env gate, dual-project pitfalls, SHA verification): [`DEPLOYMENT.md`](DEPLOYMENT.md).

## P0 — Security (do before real money / vendor files)

| Status | Item | Notes |
|--------|------|--------|
| ✅ Done | Session-bound vendor APIs | Google NextAuth required in production; vendor mutations use `requireVendorSession` |
| ✅ Done | Private blueprint + KYC storage | `vendor-private` bucket; `planasia-private://` refs; `/api/vendor/assets/view` |
| ✅ Done | RLS / column privileges | Migration `039` — anon cannot read blueprint/BOQ columns |
| ✅ Done | Cron auth | `CRON_SECRET` required in production |
| ✅ Done | Admin PIN hygiene | Env check + runtime reject default `501499` in production |
| ⬜ | Rotate all live secrets | `NEXTAUTH_SECRET`, Supabase service role, SlipMate, LINE channel secret |
| ✅ Done | Bank-transfer checkout | SlipMate verify via `/api/payments/slip`; no Stripe |
| ✅ Done | LINE webhook | `POST /api/webhooks/line` + `LINE_CHANNEL_SECRET` |

## P1 — Payouts (sellers get paid)

| Status | Item | Notes |
|--------|------|--------|
| ✅ Done | Admin “mark paid out” | `/admin/payouts` + `POST /api/admin/payouts/mark-paid` + `vendor_payout_batches` |
| ✅ Done | Admin payout export | `GET /api/admin/payouts/export` CSV (balance + bank details) |
| ✅ Done | Seller payout history UI | Draftsman payout tab: พร้อมโอน / โอนแล้ว + filter |

## P2 — Ops & polish

| Status | Item | Notes |
|--------|------|--------|
| ✅ Done | Production env gate in `npm run build` | Bootstrap warns if keys missing; set `STRICT_PRODUCTION_ENV=1` for hard fail |
| ✅ Done | Geo-IP local currency (display) | `src/lib/currency.ts` + `/api/geo` |
| ✅ Done | TH/EN storefront locale clamp | `STOREFRONT_UI_LOCALES` when `THAI_DOMESTIC_MARKET` |
| ⬜ | Single Vercel project only | Disconnect duplicate `planasia-n359` if still linked |
| ⬜ | Confirm production deploy SHA = `main` tip | Avoid serving pre–history-reset builds |
| ⬜ | Hardcopy ops queue | Admin list of orders with `hardcopy-3sets` + shipping status |
| ⬜ | Buyer order history | Account page for past purchases / download links |
| ⬜ | KYC hard gate (optional) | Block publish until KYC approved if policy requires it |
| ⬜ | Cookie / PDPA consent banner | Match privacy policy |
| ⬜ | Sentry (or similar) | Error monitoring in production |
| ⬜ | Shared rate limiting | Redis/Upstash — replace in-memory limiter |
| ⬜ | CI + checkout e2e smoke | Lint + `check:env` on build; Playwright on purchase path |

## Soft-launch gate

Digital-only soft launch is reasonable when **P0 is done**, SlipMate/Resend/env are live, and **P1 is covered by a documented manual payout SOP**.
