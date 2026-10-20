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

import { readFile, rm, writeFile } from 'fs/promises';
import { parser } from 'keep-a-changelog';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import {
  CHANGELOG_FILENAME,
  consumeChangelog,
  countUnreleasedEntries,
  FRAGMENT_DIRECTORY,
  joinUnreleased,
  readFragments,
  setBuiltFrom,
  splitUnreleased
} from './consume.mjs';
import { isMain } from './fragment.mjs';

const ROOT_PATH = fileURLToPath(new URL('../../', import.meta.url));
const UNRELEASED_LINK_PATTERN = /^\[Unreleased\]: (\S+)\/compare\/(\S+?)\.\.\.HEAD$/mu;

/**
 * Moves the sections of "[Unreleased]" into a new release below it, and updates the reference links at the bottom.
 *
 * @param {string} changelog Content of CHANGELOG.md.
 * @param {Readonly<{ date: string, version: string }>} init
 * @returns {string} New content of CHANGELOG.md.
 */
function releaseChangelog(changelog, { date, version }) {
  const unreleased = splitUnreleased(setBuiltFrom(changelog));
  const unreleasedLink = UNRELEASED_LINK_PATTERN.exec(changelog);
  const numEntries = countUnreleasedEntries(changelog);

  if (!/^\d+\.\d+\.\d+(?:-[\da-z.-]+)?$/iu.test(version)) {
    throw new Error(`Version must be like 4.19.3, got "${version}"`);
  } else if (!/^\d{4}-\d{2}-\d{2}$/u.test(date) || new Date(date).toISOString().slice(0, 10) !== date) {
    throw new Error(`Date must be like 2026-11-03, got "${date}"`);
  } else if (!numEntries) {
    throw new Error(`No entries to release, "[Unreleased]" in ${CHANGELOG_FILENAME} and .changelog/ are empty`);
  } else if (changelog.includes(`\n## [${version}]`)) {
    throw new Error(`${CHANGELOG_FILENAME} already has ${version}`);
  } else if (!unreleasedLink) {
    throw new Error(`${CHANGELOG_FILENAME}: cannot find "[Unreleased]: <URL>/compare/<tag>...HEAD"`);
  }

  const [, baseURL, previousTag] = unreleasedLink;
  const result = joinUnreleased({
    ...unreleased,
    after: `## [${version}] - ${date}\n\n${unreleased.blocks.map(({ body, heading }) => `### ${heading}\n\n${body.trim()}`).join('\n\n')}\n\n${unreleased.after}`,
    blocks: []
  }).replace(
    UNRELEASED_LINK_PATTERN,
    `[Unreleased]: ${baseURL}/compare/v${version}...HEAD\n[${version}]: ${baseURL}/compare/${previousTag}...v${version}`
  );

  const release = parser(result).releases.find(({ version: releaseVersion }) => releaseVersion?.toString() === version);
  const numParsedEntries = release ? Array.from(release.changes.values()).flat().length : 0;

  if (numParsedEntries !== numEntries) {
    throw new Error(`Keep a Changelog read ${numParsedEntries} entries in ${version} instead of ${numEntries}`);
  }

  return result;
}

async function main() {
  const {
    positionals: [version, date, ...rest]
  } = parseArgs({ allowPositionals: true });

  if (!version || !date || rest.length) {
    throw new Error('Usage: node ./scripts/changelog/release.mjs <version> <date>, e.g. 4.19.3 2026-11-03');
  }

  const changelogPath = join(ROOT_PATH, CHANGELOG_FILENAME);
  const fragments = readFragments(ROOT_PATH);

  // Writes nothing if anything fails.
  await writeFile(
    changelogPath,
    releaseChangelog(consumeChangelog(await readFile(changelogPath, 'utf8'), fragments), { date, version })
  );
  await Promise.all(fragments.map(({ filename }) => rm(join(ROOT_PATH, FRAGMENT_DIRECTORY, filename))));

  console.log(`Added ${version} to ${CHANGELOG_FILENAME}, fragments merged in and deleted: ${fragments.length}`);
}

isMain(import.meta) &&
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });

export { releaseChangelog };
