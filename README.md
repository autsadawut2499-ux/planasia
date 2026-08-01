# Planasia

Thai-first house-plan marketplace: browse and buy concept drawing sets from draftsmen and architects. Local licensed professionals should review plans before construction.

**Live:** [https://planasia.vercel.app](https://planasia.vercel.app) · **Repo:** [autsadawut2499-ux/planasia](https://github.com/autsadawut2499-ux/planasia)

## Stack

| Layer | Tech |
|-------|------|
| App | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Auth | NextAuth (Google OAuth) + admin PIN |
| Data | Supabase (Postgres, Storage, RLS) |
| Payments | Stripe Checkout (PromptPay for THB + Thailand; card for local currencies) |
| AI | Google Gemini (`GEMINI_API_KEY`) — listing assist, KYC helpers, plan-finder chat, SEO copy |
| Hosting | Vercel (`vercel.json` cron for smart ranking) |

## Current product mode

`THAI_DOMESTIC_MARKET = true` in [`src/lib/market/config.ts`](src/lib/market/config.ts):

- Store catalog / target market locked to **Thailand**
- UI language toggle: **TH / EN** only (geo/browser picks are clamped)
- Foreign document OCR / post-pay translation pipelines are gated off (code retained)
- **Display & checkout currency follow geo-IP** (JPY, EUR, USD, THB, …) — not hardcoded to THB

Prices in the database stay in **THB**; conversion uses fixed reference rates in [`src/lib/currency.ts`](src/lib/currency.ts). Unknown countries default to THB.

## Features

- **Storefront** — Catalog, filters, favorites, cart, pre-checkout review, Stripe purchase + download grants
- **Vendor dashboard** — Listings, KYC, earnings / payouts, private blueprint uploads
- **Admin** — CMS, listings moderation, KYC, commissions, payouts, ranking, mega-menu, hero/gallery/brand
- **Geo-IP** — `/api/geo` sets suggested language + local currency from edge headers or ipapi
- **AI plan chat** — Floating “AI ค้นหาแบบบ้าน” assistant → listing recommendations
- **Listing SEO** — Gemini/rules-generated title, description, and RealEstateListing JSON-LD (`seo_*` columns)
- **Partner marquee** — Brand strip on the homepage between hero and popular plans
- **Customer service** — CMS topics + external DocTranslator link in the header mega-menu
- **Hardcopy upsell** — Optional printed sets with shipping address (ops queue still evolving)
- **PWA / SEO** — Manifest, sitemap, robots, Open Graph per listing

## Quick start

```bash
npm install
cp .env.example .env.local   # fill keys as needed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful scripts:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local Next.js server |
| `npm run build` | Production env check + `next build` |
| `npm run check:env` | Same env gate used on Vercel production builds |
| `npm run test:supabase` / `test:gemini` | Connectivity smoke tests |
| `npm run setup` | Windows helper (`scripts/setup.ps1`) |

## Environment

See [`.env.example`](.env.example) for the full list.

**Required on Vercel Production** (enforced by `scripts/check-production-env.mjs` when `VERCEL_ENV=production`):

`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, Supabase URL/anon/service role, Stripe secret/webhook/publishable, `ADMIN_PIN` (not the example `501499`), `CRON_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

Optional but recommended: `GEMINI_API_KEY`, `RESEND_API_KEY` / `EMAIL_FROM` for receipts.

Never set `ALLOW_MOCK_PAYMENTS` in production (ignored even if set).

## Project structure

```
src/
├── app/                      # App Router pages + API routes
│   ├── page.tsx              # Homepage (hero, marquee, popular plans)
│   ├── store/                # Marketplace catalog + listing detail
│   ├── dashboard/draftsman/  # Vendor dashboard
│   ├── admin/                # Admin console
│   ├── about/, draftsmen/, home-building/, …
│   └── api/
│       ├── geo/              # Geo-IP → country, uiLocale, currency
│       ├── store/            # Listings, cart checkout, purchase
│       ├── gemini/           # Chat, status, translate helpers
│       ├── vendor/, admin/, webhooks/stripe/, cron/ranking/
│       └── …
├── components/               # landing, store, vendor, admin, chat, UI
├── context/AppContext.tsx    # Locale, geo country, display currency
├── lib/
│   ├── currency.ts           # Multi-currency map + THB conversion
│   ├── market/config.ts      # Thai domestic market flags
│   ├── geo/, checkout/, payments/, store/, vendor/, seo/, gemini/
│   └── …
└── middleware.ts

supabase/migrations/          # Schema through 043_listing_seo.sql
docs/                         # Production + deployment notes
templates/                    # Internal drawing references (not store products)
scripts/                      # Env check, setup, Gemini/Supabase tests
```

## Documentation

| Doc | Contents |
|-----|----------|
| [`docs/PRODUCTION_CHECKLIST.md`](docs/PRODUCTION_CHECKLIST.md) | Soft-launch security, payouts, ops checklist |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Vercel / GitHub deploy, env gate, dual-project pitfalls |
| [`templates/master/README.md`](templates/master/README.md) | กรมโยธาธิการ reference PDF policy |
| [`templates/cad/README.md`](templates/cad/README.md) | Golden Standard CAD sync notes |

## Template policy

PDF/DWG files under `templates/` are **internal reference only** (line weights, title blocks, completeness). They are **not** store products. The marketplace sells original vendor designs. See [`src/lib/templates/policy.ts`](src/lib/templates/policy.ts).

## Pricing notes

Listing sale prices are set by vendors (THB base). Platform share / vendor share are enforced in store pricing helpers. Custom workspace PDF/CAD reference prices remain in geo pricing config for legacy workspace flows.

## Deploy

1. Push to `main` on GitHub (Vercel Git integration).
2. Ensure **one** Vercel project (`planasia`) is connected — avoid a second overlapping project.
3. Production builds run `npm run build`. By default missing secrets **warn** (bootstrap). Set `STRICT_PRODUCTION_ENV=1` after keys are filled to hard-fail incomplete deploys. `ADMIN_PIN=501499` and mock payments still fail closed.
4. Confirm the Ready deployment cloned the expected commit SHA.

Details: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## License / contact

Private project. Business contact: hello@planasia.com
