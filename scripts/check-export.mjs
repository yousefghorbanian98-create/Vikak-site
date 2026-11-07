#!/usr/bin/env node
/**
 * Editorial and portability gate for the static export.
 *
 * The export is what a reviewer opens first, so it is also the strictest place
 * to enforce two rules that are easy to regress:
 *
 *   1. no em dash in rendered copy (editorial rule for this storefront)
 *   2. no absolute origin, because the domain moves to a .ir and the exported
 *      files must keep working from the filesystem
 *
 *   node scripts/check-export.mjs [path/to/index.html]
 */
import { readFileSync, existsSync } from 'node:fs';

const target = process.argv[2] ?? 'dist/index.html';

if (!existsSync(target)) {
  console.error(`${target} not found: run "npm run build && node scripts/export-static.mjs" first`);
  process.exit(1);
}

const html = readFileSync(target, 'utf8');
const failures = [];

const emDashes = html.split('\u2014').length - 1;
if (emDashes > 0) {
  const context = [];
  let at = -1;
  while ((at = html.indexOf('\u2014', at + 1)) !== -1) {
    context.push(html.slice(Math.max(0, at - 40), at + 40).replace(/\s+/g, ' '));
  }
  failures.push(`\u2014 ${emDashes} em dash(es) in rendered copy\n    ${context.slice(0, 3).join('\n    ')}`);
}

// Namespace URIs and the W3C DTD are not origins; everything else is.
const ALLOWED = /^(https?:\/\/)(www\.w3\.org|schema\.org)$/i;
const origins = [...html.matchAll(/https?:\/\/[a-z0-9.-]+/gi)].map(m => m[0]);
const offenders = [...new Set(origins.filter(url => !ALLOWED.test(url)))];
if (offenders.length > 0) {
  failures.push(`absolute origin(s) in export: ${offenders.join(', ')}`);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL  ${failure}`);
  process.exit(1);
}

console.log('PASS  export has no em dashes and no absolute origins');
console.log(`      ${target}: ${(html.length / 1024).toFixed(0)} KB checked`);
