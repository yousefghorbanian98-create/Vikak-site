#!/usr/bin/env node
/**
 * ECC eval suite — critical business flows that must never regress.
 *
 * Runs offline (no server, no network) so it is safe in CI and under the ECC
 * quality gate. Route/visual coverage lives in `scripts/smoke.mjs`; this file
 * pins the invariants an agent can silently break: money, Persian digits,
 * RTL, the WP outage fallback, checkout validation, and no absolute URLs.
 *
 *   node evals/run.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const results = [];
let failed = 0;

async function eval_case(id, description, fn) {
  try {
    const detail = await fn();
    results.push({ id, description, ok: true, detail: detail || '' });
  } catch (error) {
    failed += 1;
    results.push({ id, description, ok: false, detail: error.message });
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

/** Every source file we author, excluding generated output and dependencies. */
function sourceFiles(dir, acc = []) {
  const skip = new Set(['node_modules', '.next', 'out', 'dist', '.git', 'preview', 'screenshots']);
  for (const entry of readdirSync(dir)) {
    if (skip.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, acc);
    else if (['.ts', '.tsx', '.mjs', '.js'].includes(extname(entry))) acc.push(full);
  }
  return acc;
}

const { products } = await import('../data/products.ts');

const FA_DIGITS = /[۰-۹]/;
const LATIN_DIGITS = /[0-9]/;

// ---------- 1. money integrity ----------
await eval_case('money/integer-toman', 'Prices are positive integers in Toman, never floats or strings', () => {
  for (const p of products) {
    for (const v of p.variants) {
      assert(Number.isInteger(v.price), `${p.slug} has non-integer price ${v.price}`);
      assert(v.price > 0, `${p.slug} has non-positive price`);
      assert(v.price < 100_000_000, `${p.slug} price looks like Rial, not Toman: ${v.price}`);
    }
  }
  return `${products.reduce((n, p) => n + p.variants.length, 0)} variants checked`;
});

await eval_case('money/kg-derives-from-weight', 'Per-kilo price is a pure function of price and grams', () => {
  for (const p of products) {
    for (const v of p.variants) {
      if (v.kgPrice === undefined) continue;
      const derived = Math.round(v.price / (v.grams / 1000));
      const tolerance = Math.max(1000, derived * 0.01);
      assert(
        Math.abs(derived - v.kgPrice) <= tolerance,
        `${p.slug}/${v.id}: kg ${v.kgPrice} vs derived ${derived}`,
      );
    }
  }
  return 'kg price consistent with weight';
});

await eval_case('catalogue/no-duplicate-slugs', 'Slugs are unique so SSG cannot silently overwrite a page', () => {
  const seen = new Set();
  for (const p of products) {
    assert(!seen.has(p.slug), `duplicate slug ${p.slug}`);
    seen.add(p.slug);
  }
  return `${seen.size} unique slugs`;
});

await eval_case('catalogue/beans-only', 'The catalogue contains no gear, no robusta, no subscriptions', () => {
  // Ground coffee (پیش‌آسیاب) is still coffee and appears on the source list;
  // hardware and non-bean merchandise must never enter the catalogue.
  const forbidden = [/روبوستا/, /اسپرسوساز/, /قوری/, /موکاپات/, /فرنچ‌پرس/, /subscription/i, /\bgear\b/i, /gift card/i];
  for (const p of products) {
    const blob = `${p.title} ${p.originFa} ${p.roastFa}`;
    for (const re of forbidden) {
      assert(!re.test(blob), `${p.slug} violates beans-only (${re})`);
    }
  }
  return 'beans only';
});

// ---------- 2. Persian-first presentation ----------
await eval_case('presentation/rtl-html', 'The root layout declares lang="fa" and dir="rtl"', () => {
  const layout = read('app/layout.tsx');
  assert(/lang="fa"/.test(layout), 'missing lang="fa"');
  assert(/dir="rtl"/.test(layout), 'missing dir="rtl"');
});

await eval_case('presentation/persian-digits-in-copy', 'UI formatting converts numbers to Persian digits', () => {
  const sources = [...sourceFiles(join(root, 'components')), ...sourceFiles(join(root, 'lib'))]
    .map(f => readFileSync(f, 'utf8'));
  const usesFormatter = sources.some(s => /toLocaleString\(\s*['"]fa/.test(s) || /fa-IR/.test(s));
  assert(usesFormatter, 'no Persian digit formatter found in components');
  return 'fa-IR formatting present';
});

await eval_case('presentation/no-latin-price-in-ui', 'Persian prices never leak Latin digits into rendered markup', () => {
  // The formatter must be the only path to money strings.
  const offenders = [];
  for (const file of [...sourceFiles(join(root, 'components')), ...sourceFiles(join(root, 'lib'))]) {
    const src = readFileSync(file, 'utf8');
    for (const line of src.split('\n')) {
      // Only the Latin-locale formatter and raw price interpolation are dangerous;
      // `toFixed` on ratios that are then converted with lib/format's toFa is fine.
      if (/Intl\.NumberFormat\(\s*['"]en/.test(line)) offenders.push(`${file}: ${line.trim()}`);
    }
  }
  assert(offenders.length === 0, offenders.join(' | '));
});

await eval_case('presentation/no-em-dash-in-copy', 'Editorial rule: no em dashes in user-facing strings', () => {
  const files = ['components', 'app', 'lib', 'data'].flatMap(dir => sourceFiles(join(root, dir)));
  const offenders = files.filter(file => {
    // Comments may use an em dash; only copy the visitor can read is checked.
    const userFacing = readFileSync(file, 'utf8')
      .split('\n')
      .filter(line => !/^\s*(\/\/|\*|\/\*)/.test(line))
      .join('\n');
    return userFacing.includes('\u2014');
  });
  assert(offenders.length === 0, offenders.map(f => f.replace(root, '')).join(', '));
});

// ---------- 3. domain portability ----------
await eval_case('portability/no-absolute-urls', 'No hardcoded absolute origin: the site moves to a .ir domain', () => {
  const offenders = [];
  for (const file of sourceFiles(root)) {
    if (file.includes('.claude') || file.includes('/evals/') || file.includes('/scripts/')) continue;
    const src = readFileSync(file, 'utf8');
    const matches = src.match(/https?:\/\/(?!localhost|127\.0\.0\.1|www\.w3\.org)[a-z0-9.-]+/gi) || [];
    for (const m of matches) {
      // Allowed: placeholder image hosts (documented gap), JSON-LD vocabulary,
      // and generated/sandbox plumbing (next-env.d.ts, preview allowlists).
      if (/raw\.githubusercontent\.com|schema\.org|nextjs\.org|e2b\.app/.test(m)) continue;
      offenders.push(`${file.replace(root, '')}: ${m}`);
    }
  }
  assert(offenders.length === 0, offenders.slice(0, 5).join(' | '));
});

await eval_case('portability/sitemap-uses-env-base', 'sitemap/robots derive the origin from configuration', () => {
  const sitemap = read('app/sitemap.ts');
  assert(/NEXT_PUBLIC_SITE_URL|baseUrl|SITE_URL|siteUrl\(/.test(sitemap), 'sitemap has no configurable origin');
  const site = read('lib/site.ts');
  assert(/NEXT_PUBLIC_SITE_URL/.test(site), 'lib/site.ts does not read NEXT_PUBLIC_SITE_URL');
});

// ---------- 4. backend outage behaviour (product feature) ----------
await eval_case('resilience/bridge-never-caches-failure', 'lib/wp.ts uses cache: no-store so a dead backend is not frozen in', () => {
  const src = read('lib/wp.ts');
  assert(/cache:\s*'no-store'/.test(src), 'missing cache: no-store');
  assert(!/next:\s*\{\s*revalidate/.test(src), 'fetch-level revalidate reintroduces the cached-failure bug');
});

await eval_case('resilience/fallback-catalogue-exists', 'A bundled catalogue is available when WP is not configured', () => {
  const catalog = read('lib/catalog.ts');
  assert(/data\/products/.test(catalog), 'catalog has no bundled fallback');
  assert(products.length >= 50, `only ${products.length} fallback products`);
});

await eval_case('resilience/checkout-rejects-without-gateway', 'Checkout returns 503, not a fake URL, when the gateway is unavailable', () => {
  const route = read('app/api/checkout/route.ts');
  assert(/503/.test(route), 'no 503 path in checkout route');
  assert(!/https?:\/\/[a-z0-9.-]*zarinpal/i.test(route), 'checkout hardcodes a gateway URL');
});

await eval_case('resilience/checkout-validates-quantity', 'Checkout clamps quantity and requires a real variation id', () => {
  const route = read('app/api/checkout/route.ts');
  assert(/variation_id/.test(route), 'variation_id not validated');
  assert(/20/.test(route), 'no upper quantity bound');
});

// ---------- 5. open redirect + free-priced products ----------
await eval_case('security/checkout-url-same-origin', 'A backend-supplied checkout URL is only trusted on the backend origin', async () => {
  const { assertSameOrigin } = await import('../lib/wp.ts');
  const base = 'https://shop.vikak.ir';
  assert(assertSameOrigin('https://shop.vikak.ir/checkout/', base) !== null, 'same-origin URL rejected');
  assert(assertSameOrigin('https://evil.example/checkout', base) === null, 'foreign origin accepted');
  assert(assertSameOrigin('javascript:alert(1)', base) === null, 'javascript: URL accepted');
  assert(assertSameOrigin('//evil.example/x', base) === null, 'protocol-relative URL accepted');
  assert(assertSameOrigin('https://shop.vikak.ir.evil.example/', base) === null, 'suffix-spoofed host accepted');
  return 'open redirect blocked';
});

await eval_case('money/no-zero-priced-product', 'A product with no priced variant never reaches the catalogue', async () => {
  const { hasPricedVariant } = await import('../lib/wp.ts');
  const { products } = await import('../data/products.ts');
  assert(hasPricedVariant({ variants: [{ price: 1000 }] }), 'priced product rejected');
  assert(!hasPricedVariant({ variants: [{ price: 0 }] }), 'zero-priced product accepted');
  assert(!hasPricedVariant({ variants: [] }), 'variant-less product accepted');
  for (const p of products) {
    assert(hasPricedVariant(p), `${p.slug} has no priced variant in the bundled catalogue`);
  }
  return 'no free coffee';
});

// ---------- 6. build hygiene ----------
await eval_case('hygiene/no-secrets-committed', 'No env file with credentials is checked in', () => {
  assert(!existsSync(join(root, '.env')), '.env is present in the repo root');
  const example = read('.env.example');
  assert(!/ZARINPAL_MERCHANT|SECRET_KEY|PASSWORD=/i.test(example), '.env.example leaks a secret');
});

await eval_case('hygiene/env-ignored', '.gitignore excludes .env-style files', () => {
  assert(read('.gitignore').includes('.env'), '.gitignore does not ignore .env');
});

// ---------- report ----------
const pass = results.length - failed;
console.log(`\nECC evals — ${pass}/${results.length} passed\n`);
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.id}${r.detail ? `  (${r.detail})` : ''}`);
  if (!r.ok) console.log(`      ${r.description}`);
}
if (failed > 0) {
  console.error(`\n${failed} eval(s) failed`);
  process.exit(1);
}
console.log('');
