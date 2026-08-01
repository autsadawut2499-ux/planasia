# Planasia production checklist

Prioritized build plan for a house-plan marketplace go-live.

## P0 — Security (do before real money / vendor files)

| Status | Item | Notes |
|--------|------|--------|
| ✅ Done | Session-bound vendor APIs | Google NextAuth required in production; vendor mutations use `requireVendorSession` |
| ✅ Done | Private blueprint + KYC storage | `vendor-private` bucket; `planasia-private://` refs; `/api/vendor/assets/view` |
| ✅ Done | RLS / column privileges | Migration `039` — anon cannot read blueprint/BOQ columns |
| ✅ Done | Cron auth | `CRON_SECRET` required in production |
| ✅ Done | Admin PIN hygiene | Env check + runtime reject default `501499` in production |
| ⬜ | Rotate all live secrets | Stripe live keys, webhook secret, `NEXTAUTH_SECRET`, Supabase service role |
| ⬜ | Register Stripe webhook | `POST /api/webhooks/stripe` + `checkout.session.*` events |
| ⬜ | Never enable mock pay in prod | Already hard-disabled in code; keep env clean |

## P1 — Payouts (sellers get paid)

| Status | Item | Notes |
|--------|------|--------|
| ✅ Done | Admin “mark paid out” | `/admin/payouts` + `POST /api/admin/payouts/mark-paid` + `vendor_payout_batches` |
| ✅ Done | Payout batch / export | `GET /api/admin/payouts/export` CSV (balance + bank details) |
| ⬜ | (Optional) Stripe Connect | Automate transfers later; manual ops OK for soft launch |
| ✅ Done | Seller payout history UI | Draftsman payout tab: พร้อมโอน / โอนแล้ว + filter |

## P2 — Ops & polish

| Status | Item | Notes |
|--------|------|--------|
| ⬜ | Refund / dispute webhooks | Revoke grants + reverse commissions on Stripe refund/dispute |
| ⬜ | Hardcopy ops queue | Admin list of orders with `hardcopy-3sets` + shipping status |
| ⬜ | Buyer order history | Account page for past purchases / download links |
| ⬜ | KYC hard gate (optional) | Block publish until KYC approved if policy requires it |
| ⬜ | Cookie / PDPA consent banner | Match privacy policy |
| ⬜ | Sentry (or similar) | Error monitoring in production |
| ⬜ | Shared rate limiting | Redis/Upstash — replace in-memory limiter |
| ⬜ | CI + checkout e2e smoke | Lint + `check:env` on build; Playwright on purchase path |
| ⬜ | Disable hardcopy until ops ready | Or keep addon off in UI |

## Soft-launch gate

Digital-only soft launch is reasonable when **P0 is done**, Stripe/Resend/env are live, mock pay is off, and **P1 is covered by a documented manual payout SOP** (even before automation).
