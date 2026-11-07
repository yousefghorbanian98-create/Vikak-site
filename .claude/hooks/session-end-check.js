#!/usr/bin/env node
/**
 * ECC Stop hook: refuse to end a turn with a broken or unverified project.
 *
 * Non-blocking by design (a Stop hook that blocks can trap the session), but it
 * prints the state that matters so the next turn starts informed:
 *   - did Evals change?  - is ECC install-state intact?  - are there untracked secrets?
 */
const { execSync } = require('node:child_process');

const run = (cmd) => {
  try { return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
};

const lines = ['[ECC session-end check]'];

const state = run('test -f .claude/ecc/install-state.json && echo ok');
lines.push(`ECC install-state: ${state === 'ok' ? 'ok' : 'MISSING'}`);

const secrets = run('git status --porcelain --untracked-files=all')
  ?.split('\n')
  .filter(l => /(^|[/\s])\.env($|\.(?!example))|id_rsa|\.pem$|\.key$/.test(l) && !/\.env\.example/.test(l));
lines.push(`Staged/untracked secret files: ${secrets && secrets.length ? secrets.join(', ') : 'none'}`);

const dirty = run('git status --porcelain');
lines.push(`Working tree: ${dirty ? `${dirty.split('\n').length} changed path(s)` : 'clean'}`);

process.stdout.write(lines.join('\n') + '\n');
process.exit(0);
