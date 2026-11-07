# Security policy — ویکک

## Scope

This repository contains the Next.js storefront and the WordPress mu-plugin that exposes
the catalogue. It does not contain payment credentials. Zarinpal keys and WooCommerce API
secrets live only in the hosting environment.

## Reporting

Report vulnerabilities privately to the maintainers of this repository. Do not open a
public issue for an unpatched vulnerability, and never paste live credentials into an
issue, chat, or commit.

## Design decisions that matter for security

- **The storefront never touches payment secrets.** It posts line items to
  `vikak/v1/cart`; WooCommerce + the Zarinpal gateway own the transaction. The API returns
  a `checkoutUrl` and nothing else.
- **No secret is committed.** `.gitignore` blocks `.env` and `.env.*`; only
  `.env.example` (variable names, no values) is tracked.
- **Server-only configuration.** `NEXT_PUBLIC_WP_BASE_URL` is public and safe; any
  credential added later must not use the `NEXT_PUBLIC_` prefix.
- **Checkout input is untrusted.** `app/api/checkout/route.ts` validates quantity
  (1 to 20), requires a positive `variation_id`, and returns generic Persian messages
  rather than backend internals.
- **The mu-plugin restricts CORS** to the origins listed in `VIKAK_STOREFRONT_ORIGINS`;
  it does not send `Access-Control-Allow-Origin: *`.
- **Response headers** set `X-Content-Type-Options: nosniff`, a strict
  `Referrer-Policy` and a narrowly scoped `frame-ancestors`.
- **No third-party skills or scripts** are vendored. The only agent toolchain is ECC,
  pinned to `ecc-universal@2.2.3` and recorded in `.claude/ecc/install-state.json`.

## Automated checks

```bash
node evals/run.mjs                        # money, RTL, secrets, outage behaviour
npx -y ecc-universal@2.2.3 security-ioc-scan
node .claude/scripts/harness-audit.js
```

Dependency updates are watched by Dependabot (`.github/dependabot.yml`).
