/* eslint-env node */
/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const description = 'Bump dependencies to their latest versions based on pinning rules.';

export function help() {
  console.log(`Usage: vg bump <dev|prod>

${description}

Arguments:
  <dev|prod>   Specify whether to bump devDependencies or dependencies.
`);
}

export default function run(mode) {
  mode = (mode || '').toLowerCase();
  if (mode !== 'dev' && mode !== 'prod') {
    console.error('Usage: vg bump <dev|prod>');
    process.exit(1);
  }

  let pkg;
  try {
    const pkgText = fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8');
    pkg = JSON.parse(pkgText);
  } catch {
    console.error('Error: unable to read or parse package.json');
    process.exit(1);
  }

  const pin = pkg.pinDependencies && typeof pkg.pinDependencies === 'object' ? pkg.pinDependencies : {};
  const local = pkg.localDependencies && typeof pkg.localDependencies === 'object' ? pkg.localDependencies : {};
  const localNames = new Set(Object.keys(local));

  const depField = mode === 'dev' ? 'devDependencies' : 'dependencies';
  // eslint-disable-next-line security/detect-object-injection
  const deps = pkg[depField] && typeof pkg[depField] === 'object' ? pkg[depField] : {};

  const toBump = Object.keys(deps)
    .filter(name => !localNames.has(name))
    .sort()
    .map(name => {
      // eslint-disable-next-line security/detect-object-injection
      const pinned = pin[name];
      const version = Array.isArray(pinned) ? pinned[0] : typeof pinned === 'string' ? pinned : 'latest';
      return `${name}@${version || 'latest'}`;
    });

  if (toBump.length === 0) {
    console.log('No packages to bump.');
    return;
  }

  const npmArgs = ['install'];
  if (mode === 'prod') {
    npmArgs.push('--save-exact');
  }
  npmArgs.push(...toBump);

  console.log(`Running: npm ${npmArgs.join(' ')}`);
  const result = spawnSync('npm', npmArgs, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.error) {
    console.warn(`Warning: npm failed to start (${result.error.message}).`);
    return;
  }
  if (typeof result.status === 'number' && result.status !== 0) {
    console.warn(`Warning: npm exited with code ${result.status}.`);
  }
}
