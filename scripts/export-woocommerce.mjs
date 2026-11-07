#!/usr/bin/env node
/**
 * WooCommerce migration exporter.
 *
 * Turns data/products.ts (the single source of truth) into a CSV that the
 * official WooCommerce "Product CSV Importer" accepts, with one variation row
 * per weight so the published per-pack prices survive the migration intact.
 *
 *   node scripts/export-woocommerce.mjs
 *   → migration/woocommerce-products.csv
 *
 * The product body copy here is the same copy the Next.js site uses; nothing
 * is invented at export time — only reshaped.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { products, lowestKgPrice } from '../data/products.ts';

const HEADERS = [
  'ID', 'Type', 'SKU', 'Name', 'Published', 'Is featured?', 'Visibility in catalog',
  'Short description', 'Description', 'Tax status', 'In stock?', 'Stock', 'Categories',
  'Tags', 'Images', 'Parent', 'Position',
  'Attribute 1 name', 'Attribute 1 value(s)', 'Attribute 1 visible', 'Attribute 1 global',
  'Regular price', 'Sale price', 'Weight (kg)',
];

const esc = v => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const rows = [HEADERS];
let parentId = 1000;
let variationId = 5000;

const roastCategory = {
  green: 'دان سبز',
  light: 'رست روشن',
  medium: 'رست متوسط',
  'medium-dark': 'رست متوسط تیره',
  dark: 'رست تیره',
  espresso: 'رست اسپرسو',
};

for (const [index, p] of products.entries()) {
  const pid = parentId++;
  const notes = p.notes.join('، ');
  const kg = lowestKgPrice(p);

  const short =
    `${p.roastFa} · ۱۰۰٪ عربیکا · ${p.originFa}. یادداشت‌های طعمی: ${notes}.`;
  const description =
    `<p>${p.title} از ${p.roaster}.</p>` +
    `<p>${p.roastFa}، بدنه ${p.body}. خاستگاه: ${p.originFa} (${p.origin}). ` +
    `یادداشت‌های طعمی: ${notes}.</p>` +
    `<p>نرخ کیلویی معادل از ${new Intl.NumberFormat('fa-IR').format(kg)} تومان. ` +
    `دانه پس از ثبت سفارش برشته و در بسته‌بندی یک‌طرفه با دریچه‌ی تخلیه‌ی گاز ارسال می‌شود.</p>`;

  const categories = ['قهوه', roastCategory[p.roast]].filter(Boolean).join(', ');
  const tags = [p.originFa, p.roaster, 'عربیکا', p.origin].join(', ');
  const image = `https://raw.githubusercontent.com/yousefghorbanian98-create/Vikak-site/arena/2b6af4dd-vikak-site/public${p.image}`;

  // parent row
  rows.push([
    pid, 'variable', `VIKAK-${String(index + 1).padStart(3, '0')}`, p.title, 1, 0, 'visible',
    short, description, 'taxable', 1, '', categories, tags, image, '', 0,
    'وزن', p.variants.map(v => v.label).join(' | '), 1, 0,
    '', '', '',
  ]);

  // variation rows, one per published package
  for (const v of p.variants) {
    rows.push([
      variationId++, 'variation', `VIKAK-${String(index + 1).padStart(3, '0')}-${v.id}`,
      `${p.title} — ${v.label}`, 1, 0, 'visible',
      '', '', 'taxable', 1, '', '', '', '', pid, 0,
      'وزن', v.label, 1, 0,
      v.price, '', (v.grams / 1000).toFixed(3),
    ]);
  }
}

const csv = '\uFEFF' + rows.map(r => r.map(esc).join(',')).join('\n') + '\n';
mkdirSync('migration', { recursive: true });
writeFileSync('migration/woocommerce-products.csv', csv);

console.log(`✓ migration/woocommerce-products.csv`);
console.log(`  ${products.length} variable products, ${products.reduce((n, p) => n + p.variants.length, 0)} variations, ${rows.length - 1} data rows`);
