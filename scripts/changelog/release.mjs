/// <reference types="node" />

// Moves the entries of `.changelog/*.md` into CHANGELOG.md as a new release, then deletes the fragments.
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
import { readFragments } from './build.mjs';
import { isMain, renderSections } from './fragment.mjs';

const ROOT_PATH = fileURLToPath(new URL('../../', import.meta.url));

const CHANGELOG_PATH = join(ROOT_PATH, 'CHANGELOG.md');
const FRAGMENT_DIRECTORY_PATH = join(ROOT_PATH, '.changelog');
const UNRELEASED_LINK_PATTERN = /^\[Unreleased\]: (\S+)\/compare\/(\S+?)\.\.\.HEAD$/mu;

/**
 * Adds a release with the given sections below the "[Unreleased]" section, which is kept as is, and updates the
 * reference links at the bottom.
 *
 * @param {string} changelog Content of CHANGELOG.md.
 * @param {Readonly<{ date: string, sections: string, version: string }>} init `sections` is from `renderSections()`.
 * @returns {string} New content of CHANGELOG.md.
 */
function releaseChangelog(changelog, { date, sections, version }) {
  if (!/^\d+\.\d+\.\d+(?:-[\da-z.-]+)?$/iu.test(version)) {
    throw new Error(`Version must be like 4.19.3, got "${version}"`);
  } else if (!/^\d{4}-\d{2}-\d{2}$/u.test(date) || new Date(date).toISOString().slice(0, 10) !== date) {
    throw new Error(`Date must be like 2026-11-03, got "${date}"`);
  } else if (!sections) {
    throw new Error('No entries to release, .changelog has no fragments');
  } else if (changelog.includes(`\n## [${version}]`)) {
    throw new Error(`CHANGELOG.md already has ${version}`);
  }

  const unreleasedIndex = changelog.indexOf('\n## [Unreleased]\n');
  const previousReleaseIndex = changelog.indexOf('\n## [', unreleasedIndex + 1);
  const unreleasedLink = UNRELEASED_LINK_PATTERN.exec(changelog);

  if (!~unreleasedIndex || !~previousReleaseIndex) {
    throw new Error('CHANGELOG.md: cannot find "## [Unreleased]" followed by a release');
  } else if (!unreleasedLink) {
    throw new Error('CHANGELOG.md: cannot find "[Unreleased]: <URL>/compare/<tag>...HEAD"');
  }

  const [, baseURL, previousTag] = unreleasedLink;
  const result =
    `${changelog.slice(0, previousReleaseIndex + 1)}## [${version}] - ${date}\n\n${sections}\n\n${changelog.slice(
      previousReleaseIndex + 1
    )}`.replace(
      UNRELEASED_LINK_PATTERN,
      `[Unreleased]: ${baseURL}/compare/v${version}...HEAD\n[${version}]: ${baseURL}/compare/${previousTag}...v${version}`
    );

  const numEntries = sections.split('\n').filter(line => line.startsWith('- ')).length;
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

  const fragments = await readFragments(FRAGMENT_DIRECTORY_PATH);

  await writeFile(
    CHANGELOG_PATH,
    releaseChangelog(await readFile(CHANGELOG_PATH, 'utf8'), { date, sections: renderSections(fragments), version })
  );

  await Promise.all(fragments.map(({ filename }) => rm(join(FRAGMENT_DIRECTORY_PATH, filename))));

  console.log(`Added ${version} to CHANGELOG.md and deleted ${fragments.length} fragments`);
}

isMain(import.meta) &&
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });

export { releaseChangelog };
