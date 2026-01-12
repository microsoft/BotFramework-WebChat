#!/usr/bin/env node
/* eslint-env node */

/*
 * vibe-grep (vg)
 *
 * This script provides a unified CLI for verifying build artifacts using
 * structural pattern matching.  The idea is to consolidate ad‑hoc grep, and
 * potentially other tools into a single, portable tool.
 *
 */

import fs from 'node:fs';
import path from 'node:path';

const dirname = path.dirname(new URL(import.meta.url).pathname);

async function main() {
  // eslint-disable-next-line no-magic-numbers
  const args = process.argv.slice(2);
  const command = args.shift() || 'help';

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (fs.existsSync(path.join(dirname, 'commands', `${command}.js`))) {
    await import(`./commands/${command}.js`).then(mod => mod.default(...args));
    return;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (fs.existsSync(path.join(dirname, 'commands', `help.js`))) {
    await import(`./commands/help.js`).then(mod => mod.help(command, ...args));
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`The command '${command}' is not recognized.`);
}

main().catch(err => {
  console.error('Error executing command:', err);
  process.exit(1);
});
