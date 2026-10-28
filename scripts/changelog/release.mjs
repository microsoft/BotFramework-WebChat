/// <reference types="node" />

// Releases: merges any fragments left in `.changelog/` into CHANGELOG.md, then moves the entries of "[Unreleased]" into
// a new version. The text before the first section of "[Unreleased]", the pointer to the `changelog-unreleased` branch,
// is kept, except for the "Built from" line.
//
// Usage:
//   node ./scripts/changelog/release.mjs <version> <date>
//
// Example:
//   node ./scripts/changelog/release.mjs 4.19.3 2026-11-03

import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import { CHANGELOG_FILENAME, consume, releaseChangelog, runMain } from './changelog.mjs';

const ROOT_PATH = fileURLToPath(new URL('../../', import.meta.url));

async function main() {
  const {
    positionals: [version, date, ...rest]
  } = parseArgs({ allowPositionals: true });

  if (!version || !date || rest.length) {
    throw new Error('Usage: node ./scripts/changelog/release.mjs <version> <date>, e.g. 4.19.3 2026-11-03');
  }

  // Writes nothing if anything fails.
  const fragments = await consume(ROOT_PATH, changelog => releaseChangelog(changelog, { date, version }));

  console.log(`Added ${version} to ${CHANGELOG_FILENAME}, fragments merged in and deleted: ${fragments.length}`);
}

runMain(import.meta, main);
