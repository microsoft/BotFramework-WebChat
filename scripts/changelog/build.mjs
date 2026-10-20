/// <reference types="node" />

// Builds UNRELEASED.md from `.changelog/*.md`, or previews the entries of a pull request.
//
// Usage:
//   node ./scripts/changelog/build.mjs [--output UNRELEASED.md]
//   node ./scripts/changelog/build.mjs --pr <PR#> [--optional]

import { execFileSync } from 'child_process';
import { readdir, readFile, writeFile } from 'fs/promises';
import { parser } from 'keep-a-changelog';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import {
  isMain,
  parseFragment,
  parseFragmentFilename,
  README_FILENAME,
  renderSections,
  REPOSITORY_URL
} from './fragment.mjs';

const ROOT_PATH = fileURLToPath(new URL('../../', import.meta.url));

const FRAGMENT_DIRECTORY_PATH = join(ROOT_PATH, '.changelog');
const UNRELEASED_URL = `${REPOSITORY_URL}/blob/changelog-unreleased/UNRELEASED.md`;

// The only content of the "[Unreleased]" section of CHANGELOG.md, entries are in `.changelog/`.
const UNRELEASED_NOTE = `Entries for the next release are in [\`UNRELEASED.md\`](${UNRELEASED_URL}), built from one file per pull request in [\`.changelog/\`](${REPOSITORY_URL}/tree/main/.changelog).`;

/**
 * Returns when the fragment was last added to the current branch, via `git log`.
 *
 * Fragments added in the same commit share the same time.
 *
 * @param {string} path Path of the fragment.
 * @returns {number | undefined} Commit time in seconds, or `undefined` if the fragment is not committed.
 */
function getGitAddedTime(path) {
  // "--no-renames" so a renamed fragment counts as added when it was renamed.
  const output = execFileSync('git', ['log', '-1', '--diff-filter=A', '--format=%ct', '--no-renames', '--', path], {
    cwd: join(path, '..'),
    encoding: 'utf8'
  }).trim();

  return output ? +output : undefined;
}

/**
 * Reads and sorts all fragments in a directory: by the time they were added (merge time on `main`), uncommitted ones
 * last, then by pull request number.
 *
 * @param {string} directoryPath Path of the `.changelog` directory.
 * @param {Readonly<{ getAddedTime?: ((path: string) => number | undefined) | undefined }>} [init]
 * @returns {Promise<readonly Readonly<{ filename: string, prNumber: number, sections: Readonly<Record<string, readonly string[]>> }>[]>}
 */
async function readFragments(directoryPath, { getAddedTime = getGitAddedTime } = {}) {
  const filenames = (
    await readdir(directoryPath).catch(error => (error.code === 'ENOENT' ? [] : Promise.reject(error)))
  )
    .filter(filename => filename !== README_FILENAME)
    .sort();

  const unknownFilename = filenames.find(filename => !parseFragmentFilename(filename));

  if (unknownFilename) {
    throw new Error(`.changelog/${unknownFilename}: fragment filename must be "<PR#>-<slug>.md"`);
  }

  const fragments = await Promise.all(
    filenames.map(async filename => {
      const path = join(directoryPath, filename);

      return Object.freeze({
        addedTime: getAddedTime(path) ?? Infinity,
        fragment: parseFragment(await readFile(path, 'utf8'), filename)
      });
    })
  );

  return Object.freeze(
    fragments
      .sort((x, y) => x.addedTime - y.addedTime || x.fragment.prNumber - y.fragment.prNumber)
      .map(({ fragment }) => fragment)
  );
}

/**
 * Returns the legend of CHANGELOG.md, from "Legends:" up to the first release heading.
 *
 * @param {string} changelog Content of CHANGELOG.md.
 * @returns {string} Legend without trailing newline.
 */
function getLegend(changelog) {
  const legend = /^Legends:\n[\s\S]*?(?=\n## )/mu.exec(changelog);

  if (!legend) {
    throw new Error('CHANGELOG.md: cannot find "Legends:" before the first release');
  }

  return legend[0].trimEnd();
}

/**
 * Checks that the "[Unreleased]" section of CHANGELOG.md only links to UNRELEASED.md. Only `release.mjs` adds entries to
 * CHANGELOG.md.
 *
 * @param {string} changelog Content of CHANGELOG.md.
 */
function validateUnreleasedSection(changelog) {
  const section = /^## \[Unreleased\]\n([\s\S]*?)(?=^## )/mu.exec(changelog);

  if (section?.[1].trim() !== UNRELEASED_NOTE) {
    throw new Error(
      `CHANGELOG.md: the "[Unreleased]" section was edited, add a .changelog/<PR#>-<slug>.md fragment instead (see .changelog/README.md), only releases via scripts/changelog/release.mjs write entries to CHANGELOG.md`
    );
  }
}

/**
 * Parses the Markdown with Keep a Changelog and checks that every entry is read back.
 *
 * @param {string} markdown Markdown of a changelog.
 * @param {number} numEntries Number of entries expected in the first release.
 */
function validateChangelog(markdown, numEntries) {
  const [release] = parser(markdown).releases;
  const numParsedEntries = release ? Array.from(release.changes.values()).flat().length : 0;

  if (numParsedEntries !== numEntries) {
    throw new Error(`Keep a Changelog read ${numParsedEntries} entries instead of ${numEntries}`);
  }
}

/**
 * Renders UNRELEASED.md: a header, the legend of CHANGELOG.md, and the entries of all fragments.
 *
 * @param {Readonly<{ fragments: readonly { sections: Readonly<Record<string, readonly string[]>> }[], legend: string }>} init
 * @returns {string}
 */
function renderUnreleased({ fragments, legend }) {
  const sections = renderSections(fragments);
  const markdown = `<!-- Generated by scripts/changelog/build.mjs from the .changelog folder on main, do not edit. -->

# Unreleased changes

These changes are on the \`main\` branch and will be in the next release. Released changes are in [\`CHANGELOG.md\`](${REPOSITORY_URL}/blob/main/CHANGELOG.md).

${legend}

## [Unreleased]
${sections && `\n${sections}\n`}`;

  validateChangelog(markdown, fragments.flatMap(fragment => Object.values(fragment.sections).flat()).length);

  return markdown;
}

/**
 * Renders the entries of a pull request for the job summary.
 *
 * @param {readonly Readonly<{ filename: string, prNumber: number, sections: Readonly<Record<string, readonly string[]>> }>[]} fragments
 * @param {Readonly<{ optional: boolean, prNumber: number }>} init
 * @returns {string}
 */
function renderPreview(fragments, { optional, prNumber }) {
  const pullRequestFragments = fragments.filter(fragment => fragment.prNumber === prNumber);
  const [fragment] = pullRequestFragments;

  if (pullRequestFragments.length > 1) {
    throw new Error(
      `Found ${pullRequestFragments.length} fragments for #${prNumber} (${pullRequestFragments.map(({ filename }) => filename).join(', ')}), use one file per pull request`
    );
  } else if (!fragment && !optional) {
    throw new Error(
      `Missing .changelog/${prNumber}-<slug>.md, add it with "node ./scripts/changelog/new.mjs", or label the pull request "no-changelog" if it only changes the development environment`
    );
  }

  return fragment
    ? `## Changelog\n\nFrom \`.changelog/${fragment.filename}\`, published to [\`UNRELEASED.md\`](${UNRELEASED_URL}) when merged:\n\n${renderSections([fragment])}\n`
    : '## Changelog\n\nNo entries, labeled `no-changelog`.\n';
}

async function main() {
  const {
    values: { optional, output, pr }
  } = parseArgs({
    options: {
      optional: { default: false, type: 'boolean' },
      output: { type: 'string' },
      pr: { type: 'string' }
    }
  });

  if (pr !== undefined && !/^[1-9]\d*$/u.test(pr)) {
    throw new Error(`--pr must be a pull request number, got "${pr}"`);
  }

  const changelog = await readFile(join(ROOT_PATH, 'CHANGELOG.md'), 'utf8');
  const fragments = await readFragments(FRAGMENT_DIRECTORY_PATH, pr ? { getAddedTime: () => undefined } : {});

  // Pull requests must not add entries to CHANGELOG.md.
  pr && validateUnreleasedSection(changelog);

  // Builds everything even when previewing, so every fragment is validated.
  const unreleased = renderUnreleased({ fragments, legend: getLegend(changelog) });

  const result = pr ? renderPreview(fragments, { optional, prNumber: +pr }) : unreleased;

  output ? await writeFile(output, result) : process.stdout.write(result);
}

isMain(import.meta) &&
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });

export {
  getGitAddedTime,
  getLegend,
  readFragments,
  renderPreview,
  renderUnreleased,
  UNRELEASED_NOTE,
  validateChangelog,
  validateUnreleasedSection
};
