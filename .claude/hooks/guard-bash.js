#!/usr/bin/env node
/**
 * ECC PreToolUse guardrail for this repository.
 *
 * Blocks the two mistakes that actually cost us time here:
 *   1. vendoring third-party skill bundles instead of using ECC
 *   2. committing secrets or wiping the project root
 *
 * Reads the Claude Code hook payload on stdin; exits 2 with a message on stderr
 * to deny the tool call, exits 0 to allow it.
 */
let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { raw += chunk; });
process.stdin.on('end', () => {
  let payload = {};
  try { payload = JSON.parse(raw || '{}'); } catch { process.exit(0); }

  const command = payload?.tool_input?.command;
  if (typeof command !== 'string') process.exit(0);

  const deny = (reason) => {
    process.stderr.write(`ECC guard: ${reason}\n`);
    process.exit(2);
  };

  if (/rm\s+-rf\s+(\/|~|\$HOME|\.\.?)(\s|$)/.test(command)) {
    deny('refusing to delete the workspace root');
  }

  const foreignSkill = command.match(/(taste|finn-build|finn-spec|ui-ux-pro-max|design-motion-principles)/);
  if (foreignSkill && /(git clone|npx\s+\S*skill|cp\s+-r|curl|wget)/.test(command)) {
    deny(`third-party skill "${foreignSkill[1]}" is not permitted; ECC is the only skill source`);
  }

  if (/git\s+add\s+(-A|\.)\s*$/.test(command) && /\b(\.env|credentials|\.pem|\.key)\b/.test(command)) {
    deny('never stage secret files');
  }

  process.exit(0);
});
