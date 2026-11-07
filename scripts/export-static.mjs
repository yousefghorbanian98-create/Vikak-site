#!/usr/bin/env node
/**
 * Export the built Next.js site into a fully standalone folder (`dist/`)
 * that opens straight from the filesystem — no server, no sandbox, no network.
 *
 *   npm run build && npm run export:static
 *
 * Rewrites absolute paths (`/_next/…`, `/images/…`, `/products/…`) into
 * relative ones so `file://` navigation works from any directory depth.
 */
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appDir = path.join(root, '.next', 'server', 'app');
const dist = path.join(root, 'dist');

if (!existsSync(appDir)) {
  console.error('Missing .next/server/app — run `next build` first.');
  process.exit(1);
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const htmlFiles = await walk(appDir);
const routes = htmlFiles.map(f => path.relative(appDir, f).split(path.sep).join('/')).sort();

/** Rewrite one prerendered HTML file for file:// usage. */
function rewrite(html, depth) {
  const up = '../'.repeat(depth);
  const upAttr = depth === 0 ? '' : up;

  return (
    html
      // 1. assets
      .replaceAll('"/_next/', `"${upAttr}_next/`)
      .replaceAll('"/images/', `"${upAttr}images/`)
      // Next emits the app icon with a hashed filename; map it onto the copy in /images
      .replace(/"\/icon\.svg\?[^"]*"/g, `"${upAttr}images/icon.svg"`)
      // 2. product links → sibling .html files
      .replace(/href="\/products\/([a-z0-9-]+)"/g, `href="${upAttr}products/$1.html"`)
      // 3. static top-level pages
      .replace(/href="\/about"/g, `href="${upAttr}about.html"`)
      .replace(/href="\/faq"/g, `href="${upAttr}faq.html"`)
      // 4. home + home anchors
      .replace(/href="\/#([a-zA-Z-]+)"/g, `href="${upAttr}index.html#$1"`)
      .replace(/href="\/"/g, `href="${upAttr}index.html"`)
  );
}

for (const file of htmlFiles) {
  const rel = path.relative(appDir, file).split(path.sep).join('/');
  const depth = rel.split('/').length - 1;
  const html = rewrite(await readFile(file, 'utf8'), depth);
  const target = path.join(dist, rel);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
}

// ---------- assets ----------
await cp(path.join(root, '.next', 'static'), path.join(dist, '_next', 'static'), { recursive: true });

const publicDir = path.join(root, 'public');
if (existsSync(publicDir)) {
  for (const entry of await readdir(publicDir)) {
    const src = path.join(publicDir, entry);
    const isDir = (await stat(src)).isDirectory();
    await cp(src, path.join(dist, entry), { recursive: isDir });
  }
}

const slugs = routes
  .filter(r => r.startsWith('products/') && r.endsWith('.html'))
  .map(r => r.slice('products/'.length, -'.html'.length));

await writeFile(
  path.join(dist, 'routes.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), pages: routes.length, slugs }, null, 2),
);

console.log(`✓ ${routes.length} HTML pages → dist/  (${slugs.length} product pages)`);
console.log('  open dist/index.html directly — no server required');
