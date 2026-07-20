# Planasia

AI-powered regional architectural design platform for Thailand, Asia, and India. Generate building permit-ready A3 plans compliant with local building codes.

## Features (Phase 2)

- **PDF permit drawing set** — Multi-sheet A3 export (categories A, S, SN, E) via `/api/download`
- **Gemini AI** — Real plan data + 3D/floor plan images when `GEMINI_API_KEY` is set (fallback otherwise)
- **Dual-AI chat** — Designer + Validator via Gemini SDK
- **Payments** — Stripe Checkout (card + PromptPay for TH); mock mode without keys
- **Google OAuth** — NextAuth sign-in when Google credentials configured
- **CAD export** — Basic DXF floor plan outlines

## Quick Start

```bash
cd Projects/planasia
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment

Copy `.env.example` to `.env.local` and fill in keys as needed:

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | AI plan data, images, chat |
| `GOOGLE_CLIENT_ID/SECRET` + `NEXTAUTH_SECRET` | Google sign-in |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | Live payments |

Without API keys, the app runs in **fallback mode** (deterministic plans + mock payment).

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── workspace/page.tsx    # Main design workspace
│   ├── store/page.tsx        # Ready-to-buy catalog
│   └── api/
│       ├── geo/route.ts      # IP geolocation
│       ├── generate/route.ts # AI render + plan generation
│       ├── download/route.ts # PDF/CAD download (token-gated)
│       ├── payment/route.ts  # Stripe / mock payment
│       ├── auth/[...nextauth]/ # Google OAuth
│       └── chat/route.ts     # Dual-AI chat endpoint
├── lib/
│   ├── pdf/generator.ts      # A3 permit PDF assembly
│   ├── plans/                # Plan schema + storage
│   ├── ai/gemini.ts          # Gemini SDK client
│   └── payments/stripe.ts    # Stripe Checkout
└── components/               # UI (workspace, landing, layout)
```

## Template Policy (กรมโยธาธิการ Reference Files)

**Important:** PDF files in `templates/master/` are **internal reference only**.

| Purpose | Details |
|---------|---------|
| What they are | Sample templates and drawing patterns from กรมโยธาธิการ for AI to learn line weights, title blocks, symbols, and sheet layout |
| What they are NOT | Products for sale on the Store |
| Store sells | **Original house designs co-created by users and AI**, using government samples only as technical guidance |

See [`templates/master/README.md`](templates/master/README.md) and [`src/lib/templates/policy.ts`](src/lib/templates/policy.ts).

## Pricing Rules (built-in)

| Type | PDF | CAD |
|------|-----|-----|
| Store (community AI design) | 1,000 THB | — |
| Custom 1-floor | 1,990 THB | 4,990 THB |
| Custom 2-floor | 2,990 THB | 4,990 THB |

## Reference Patterns (Internal — NOT Store Products)

| Library | Format | Purpose |
|---------|--------|---------|
| `templates/master/` | PDF | กรมโยธาธิการ drawing patterns |
| `templates/cad/smart-a-golden/` | DWG | **Golden Standard** — Smart A TYPE E complete house set (32 files) |
| `templates/cad/golden-standard.json` | JSON | Completeness checklist + auto-fill rules |

**Smart A Golden Standard** is the platform's primary guideline for permit-ready drawing sets (A/S/SN/E/ME/AC). Three sheets auto-generated when absent: roof plan, roof structure, structural calculation report.

Sync locally: `node scripts/sync-cad-templates.mjs` — see `templates/cad/README.md`.

## PDF Drawing Set (Phase 2)

Generated sheets include:

| Category | Sheets |
|----------|--------|
| **A** Architectural | Index, Site Plan, Floor Plans, Roof, Elevations, Sections, Bathroom/Stair/Door details |
| **S** Structural | Foundation/Pile, Beams, Roof structure, Details, Calculation report |
| **SN** Sanitary | Per-floor plumbing, septic, rainwater |
| **E** Electrical | Per-floor lighting/power, Single Line Diagram |
