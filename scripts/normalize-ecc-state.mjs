#!/usr/bin/env node
/**
 * Make ECC's install-state portable.
 *
 * `ecc install` writes absolute paths into `.claude/ecc/install-state.json`
 * (target root, install-state path, every managed operation's source and
 * destination). That is correct on the machine that ran the install and wrong
 * everywhere else: on CI or a fresh clone `ecc doctor` reports
 *
 *   [error] unsafe-managed-destination: 627 managed operation(s) target an
 *   unsafe destination
 *
 * because every recorded destination points outside the checkout. This script
 * rewrites those paths relative to the project root, which is what the state
 * should have contained in the first place.
 *
 *   node scripts/normalize-ecc-state.mjs           # rewrite in place
 *   node scripts/normalize-ecc-state.mjs --check   # exit 1 if not portable
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const statePath = path.join(process.cwd(), '.claude', 'ecc', 'install-state.json');
const check = process.argv.includes('--check');

const state = JSON.parse(readFileSync(statePath, 'utf8'));
const original = JSON.stringify(state);

/** Turn an absolute in-project path into a project-relative one. */
function relativize(value) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) return value;
  const root = process.cwd();
  if (value === root) return '.';
  if (value.startsWith(root + path.sep)) {
    return value.slice(root.length + 1).split(path.sep).join('/');
  }
  // Installer sources live in the npx cache; keep them portable too.
  const marker = `${path.sep}node_modules${path.sep}`;
  const at = value.lastIndexOf(marker);
  if (at !== -1) return `npx:${value.slice(at + marker.length).split(path.sep).join('/')}`;
  return value;
}

state.target.root = relativize(state.target.root);
state.target.installStatePath = relativize(state.target.installStatePath);

for (const op of state.operations ?? []) {
  if ('sourcePath' in op) op.sourcePath = relativize(op.sourcePath);
  if ('destinationPath' in op) op.destinationPath = relativize(op.destinationPath);
}

const updated = JSON.stringify(state, null, 2) + '\n';
const changed = JSON.stringify(state) !== original;

if (check) {
  const leftovers = JSON.stringify(state.operations ?? []).match(/"\/[a-z]+\//g)?.length ?? 0;
  if (leftovers > 0) {
    console.error(`install-state is not portable: ${leftovers} absolute path(s) remain`);
    process.exit(1);
  }
  console.log('install-state is portable');
  process.exit(0);
}

writeFileSync(statePath, updated);
console.log(`install-state normalized (${changed ? 'rewritten' : 'already portable'})`);
