#!/usr/bin/env node
/**
 * Content smoke test — no browser required.
 * Verifies every route renders, Persian digits are used, and the catalogue
 * data stays internally consistent.
 *
 *   node scripts/smoke.mjs [baseUrl]
 */
import { products } from '../data/products.ts';

const base = process.argv[2] || 'http://127.0.0.1:3000';
const failures = [];
const checks = [];

function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

async function get(path) {
  const res = await fetch(base + path, { redirect: 'follow' });
  return { status: res.status, html: await res.text() };
}

// ---------- data invariants ----------
check('catalogue has products', products.length > 40, `${products.length} items`);

const slugs = new Set();
for (const p of products) {
  if (slugs.has(p.slug)) check(`unique slug: ${p.slug}`, false);
  slugs.add(p.slug);
  check(`variants exist: ${p.id}`, p.variants.length > 0);
  check(`image exists: ${p.id}`, Boolean(p.image));
  check(`prices are positive integers: ${p.id}`, p.variants.every(v => Number.isInteger(v.price) && v.price > 0));
  check(`gram weights positive: ${p.id}`, p.variants.every(v => v.grams > 0));
  check(`arabica only: ${p.id}`, products.every(x => !/روبوستا/.test(x.title)));
}

// ---------- routes ----------
const home = await get('/');
check('home 200', home.status === 200, String(home.status));
check('home is RTL', /<html lang="fa" dir="rtl">/.test(home.html));
check('home has hero headline', home.html.includes('هر دانه'));
check('home shows every product', products.every(p => home.html.includes(p.slug)));
check('home has newsletter', home.html.includes('subscribe'));
check('home uses Persian digits', /[۰-۹]/.test(home.html));

const about = await get('/about');
check('about 200', about.status === 200, String(about.status));

const faq = await get('/faq');
check('faq 200', faq.status === 200, String(faq.status));
check('faq has FAQPage schema', faq.html.includes('FAQPage'));

const pdp = await get(`/products/${products[0].slug}`);
check('pdp 200', pdp.status === 200, String(pdp.status));
check('pdp has product schema', pdp.html.includes('"@type":"Product"'));
check('pdp shows variant price', pdp.html.includes('تومان'));

const missing = await get('/this-page-does-not-exist');
check('404 status', missing.status === 404, String(missing.status));

const sitemap = await get('/sitemap.xml');
check('sitemap lists all products', products.every(p => sitemap.html.includes(`/products/${p.slug}`)));

const robots = await get('/robots.txt');
check('robots present', robots.html.includes('Sitemap:'));

// ---------- headless contract ----------
const checkout = await fetch(`${base}/api/checkout`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items: [] }),
});
check('checkout rejects empty cart', [400, 503].includes(checkout.status), String(checkout.status));

const catalogSource = home.html.includes('زنده از ووکامرس')
  ? 'wordpress'
  : home.html.includes('نسخه‌ی نمایشی')
    ? 'bundled'
    : 'unknown';
check('catalogue states its source', catalogSource !== 'unknown', catalogSource);
check('catalogue renders products regardless of source', home.html.includes('class="card"'));

// ---------- cli colorized report ----------
const pass = checks.filter(c => c.ok).length;
const color = (ok) => (ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m');
console.log(`\n  ${pass}/${checks.length} checks passed\n`);
for (const f of failures) console.log(`  ${color(false)} ${f}`);
if (!failures.length) console.log(`  ${color(true)} all green`);
process.exit(failures.length ? 1 : 0);
