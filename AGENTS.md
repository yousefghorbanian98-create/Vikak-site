# AGENTS.md — ویکک (Vikak) under ECC

Project instruction file for agentic coding. **ECC is the only toolchain**: every rule,
agent, command and skill used on this repository comes from ECC 2.2.3 installed at
`.claude/` (see `.claude/ecc/install-state.json`). No third-party skill bundles are
permitted in this repository.

## 1. Product contract (non-negotiable)

- Persian-first, RTL. All UI copy is Persian. `dir="rtl"` and `lang="fa"` are set on `<html>`.
- **Coffee beans only.** No brewing gear, no accessories, no subscriptions, no gift cards.
- Prices come *only* from the supplied Aban 1405 roastery list (`data/products.ts`,
  `migration/woocommerce-products.csv`). Never invent a price, a stock count, a phone
  number, an address, a social handle, or a product.
- No inventory counts in the UI. Availability is either "موجود" / "ناموجود" derived from
  the backend, never a fabricated number.
- No addresses, no phone numbers, no map, no invented business identity beyond the
  supplied roastery facts.
- The site will live on a `.ir` domain: **no hardcoded absolute URLs** anywhere in
  components, metadata, or data. Use relative paths or `NEXT_PUBLIC_SITE_URL`.

## 2. Architecture

```
WooCommerce (WordPress)  ── vikak/v1 REST ──►  Next.js 16 App Router (this repo)
owns price / stock / cart /                    SSG + ISR 300s, RTL, Vazirmatn
Zarinpal / shipping / invoices
```

- `lib/wp.ts` — the only place that speaks to WordPress. Uses `cache: 'no-store'` so a
  failed backend fetch is never cached (Next 16 will otherwise cache the failure).
- `lib/catalog.ts` — `getCatalogue()` / `getProductBySlug()` / `getAllSlugs()`. Falls back
  to the bundled catalogue when `NEXT_PUBLIC_WP_BASE_URL` is unset or unreachable.
- `app/api/checkout/route.ts` — validates line items and returns `{ checkoutUrl }` or a
  400/502/503 with a Persian message. Never fabricate a checkout URL.
- `wordpress/vikak-headless.php` — mu-plugin registering `vikak/v1/catalog`,
  `vikak/v1/catalog/<slug>`, `vikak/v1/cart`. Contract documented in `docs/HEADLESS.md`.
- Outage behaviour is a product feature, not an error state: without a backend URL the
  site renders the bundled catalogue with the label «نسخه‌ی نمایشی»; with a URL that
  fails it renders the same catalogue plus a warning; checkout returns 503.

## 3. Quality gates (all must pass before any commit)

```bash
npx tsc --noEmit          # types
npm run build             # production build, 58 static pages expected
npx tsx scripts/smoke.mjs # 284 assertions
node scripts/export-static.mjs   # dist/ output
```

Plus the ECC gates:

```bash
node .claude/scripts/harness-audit.js            # harness score
node ~/.claude/plugins/cache/ecc/ecc/2.2.3/scripts/skills-health.js
npx -y ecc-universal@2.2.3 doctor
npx -y ecc-universal@2.2.3 status
```

Editorial gate: **no em dashes** in user-facing copy (Persian uses «—» sparingly; the
copy-lint checks `dist/index.html`). Do not lint pages from `curl` output.

## 4. Code conventions (from `.claude/rules/ecc/common` + `typescript`)

- TypeScript strict, no `any` in new code; explicit return types on exported functions.
- Functional components, no class components. Server components by default; `'use client'`
  only when state/effects are required.
- Immutability: never mutate props or module-level arrays in place.
- All animation must respect `prefers-reduced-motion`. Effect-heavy scenes are rejected
  for this "place/product" site.
- Persian text: use Persian digits (۰-۹) in UI, Latin digits only in code and JSON-LD.

## 5. Working agreement

- Report the ECC tool name and pipeline stage for every ECC invocation.
- Answer in Persian.
- Do not hand over guessed preview URLs; deliver workspace files or release artifacts.
- Keep `docs/HEADLESS.md` and `README.md` in sync with any contract change.
- Never commit secrets. `.env.example` documents the variables; real `.env*` is ignored.
