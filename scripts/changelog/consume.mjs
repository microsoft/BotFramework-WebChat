/// <reference types="node" />

// Merges the entries of `.changelog/*.md` into the "[Unreleased]" section of CHANGELOG.md, then deletes the fragments.
// Entries already in the section are kept, new ones are added at the end of their section.
//
// Usage:
//   node ./scripts/changelog/consume.mjs
//
// Only fragments committed at HEAD are read, ordered by the time they were merged into `main`. The first line
// of "[Unreleased]" then says which commit it was built from: "Built from [`a002cbf`](<URL>/commit/<SHA>)."

import { execFileSync } from 'child_process';
import { readFile, rm, writeFile } from 'fs/promises';
import { parser } from 'keep-a-changelog';
import { join } from 'path';
import { fileURLToPath } from 'url';
import {
  CREATE_PULL_REQUEST_FIRST,
  isMain,
  parseFragment,
  parseFragmentFilename,
  PLACEHOLDER_PATTERN,
  README_FILENAME,
  REPOSITORY_URL,
  SECTIONS
} from './fragment.mjs';

// Matches the "Built from" line with the empty lines after it.
const BUILT_FROM_PATTERN = /^Built from \[`[\da-f]+`\]\(\S+\/commit\/[\da-f]+\)\.\n*/gmu;
const CHANGELOG_FILENAME = 'CHANGELOG.md';
const FRAGMENT_DIRECTORY = '.changelog';
const ROOT_PATH = fileURLToPath(new URL('../../', import.meta.url));

/**
 * @param {string} cwd Path of the Git repository.
 * @param {readonly string[]} args
 * @returns {string} Output as is.
 */
function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/**
 * Reads the fragments committed at a commit, ordered by the time they were merged, then by pull request number.
 *
 * Only the first parents are followed, so a fragment added on a branch has the time of the merge commit, not of the
 * commit on the branch. Fragments added in the same commit, such as a squash merge, share the same time.
 *
 * @param {string} cwd Path of the Git repository.
 * @param {string} [commit] Commit to read from, `HEAD` by default.
 * @returns {readonly Readonly<{ filename: string, prNumber: number, sections: Readonly<Record<string, readonly string[]>> }>[]}
 */
function readFragments(cwd, commit = 'HEAD') {
  // Empty when there is no `.changelog` directory.
  const filenames = git(cwd, ['ls-tree', '--name-only', commit, '--', `${FRAGMENT_DIRECTORY}/`])
    .split('\n')
    .map(path => path.slice(FRAGMENT_DIRECTORY.length + 1))
    .filter(filename => filename && filename !== README_FILENAME);

  const unknownFilename = filenames.find(filename => !parseFragmentFilename(filename));

  if (unknownFilename) {
    const placeholder = PLACEHOLDER_PATTERN.exec(unknownFilename)?.[0];

    throw new Error(
      `${FRAGMENT_DIRECTORY}/${unknownFilename}: fragment filename must be "<PR#>-<slug>.md"${placeholder ? `, "${placeholder}" is a placeholder, ${CREATE_PULL_REQUEST_FIRST}` : ''}`
    );
  }

  return Object.freeze(
    filenames
      .map(filename => {
        const path = `${FRAGMENT_DIRECTORY}/${filename}`;

        // "--no-renames" so a renamed fragment counts as added when it was renamed.
        const addedTime = git(cwd, [
          'log',
          '-1',
          '--diff-filter=A',
          '--first-parent',
          '--format=%ct',
          '--no-renames',
          commit,
          '--',
          path
        ]);

        return Object.freeze({
          addedTime: +addedTime,
          fragment: parseFragment(git(cwd, ['show', `${commit}:${path}`]), filename)
        });
      })
      .sort((x, y) => x.addedTime - y.addedTime || x.fragment.prNumber - y.fragment.prNumber)
      .map(({ fragment }) => fragment)
  );
}

/**
 * Splits CHANGELOG.md around the content of its "[Unreleased]" section.
 *
 * @param {string} changelog Content of CHANGELOG.md.
 * @returns {Readonly<{ after: string, before: string, blocks: readonly Readonly<{ body: string, heading: string }>[], preamble: string }>}
 *    `preamble` is the text before the first "###" heading, such as the pointer to the `changelog-unreleased` branch.
 */
function splitUnreleased(changelog) {
  const match = /^## \[Unreleased\]\n([\s\S]*?)(?=^## \[)/mu.exec(changelog);

  if (!match) {
    throw new Error(`${CHANGELOG_FILENAME}: cannot find "## [Unreleased]" followed by a release`);
  }

  const start = match.index + match[0].length - match[1].length;
  const [preamble, ...blocks] = match[1].split(/^(?=### )/mu);
  const hasPreamble = !preamble.startsWith('### ');

  return Object.freeze({
    after: changelog.slice(start + match[1].length),
    before: changelog.slice(0, start),
    blocks: Object.freeze(
      (hasPreamble ? blocks : [preamble, ...blocks]).map(block => {
        const [heading, ...lines] = block.split('\n');

        return Object.freeze({ body: lines.join('\n'), heading: heading.slice(4).trim() });
      })
    ),
    preamble: hasPreamble ? preamble : ''
  });
}

/**
 * Joins what `splitUnreleased()` returns, with one empty line between paragraphs.
 *
 * @param {ReturnType<typeof splitUnreleased>} init
 * @returns {string} Content of CHANGELOG.md.
 */
function joinUnreleased({ after, before, blocks, preamble }) {
  const paragraphs = [preamble.trim(), ...blocks.map(({ body, heading }) => `### ${heading}\n\n${body.trim()}`)].filter(
    Boolean
  );

  return `${before}${paragraphs.length ? `\n${paragraphs.join('\n\n')}\n\n` : '\n'}${after}`;
}

/**
 * Counts the entries of "[Unreleased]", as read by Keep a Changelog.
 *
 * @param {string} changelog Content of CHANGELOG.md.
 * @returns {number}
 */
function countUnreleasedEntries(changelog) {
  const release = parser(changelog).releases.find(({ version }) => !version);

  return release ? Array.from(release.changes.values()).flat().length : 0;
}

/**
 * Sets or removes the "Built from" line at the top of "[Unreleased]", there is at most one.
 *
 * @param {string} changelog Content of CHANGELOG.md.
 * @param {string | undefined} commit Full hash of the commit, `undefined` to remove the line.
 * @returns {string} New content of CHANGELOG.md.
 */
function setBuiltFrom(changelog, commit) {
  if (commit !== undefined && !/^[\da-f]{40}(?:[\da-f]{24})?$/u.test(commit)) {
    throw new Error(`Commit must be a full hash, got "${commit}"`);
  }

  const unreleased = splitUnreleased(changelog);
  const preamble = unreleased.preamble.trim().replace(BUILT_FROM_PATTERN, '');

  return joinUnreleased({
    ...unreleased,
    preamble: commit
      ? `Built from [\`${commit.slice(0, 7)}\`](${REPOSITORY_URL}/commit/${commit}).\n\n${preamble}`
      : preamble
  });
}

/**
 * Adds the entries of fragments at the end of their sections in "[Unreleased]", creating missing sections in the order
 * of `SECTIONS`. Everything else in CHANGELOG.md is kept.
 *
 * @param {string} changelog Content of CHANGELOG.md.
 * @param {readonly { sections: Readonly<Record<string, readonly string[]>> }[]} fragments Sorted fragments.
 * @param {Readonly<{ commit?: string | undefined }>} [init] With fragments, `commit` replaces the "Built from" line.
 * @returns {string} New content of CHANGELOG.md.
 */
function consumeChangelog(changelog, fragments, { commit } = {}) {
  const unreleased = splitUnreleased(commit && fragments.length ? setBuiltFrom(changelog, commit) : changelog);
  const blocks = [...unreleased.blocks];

  for (const section of SECTIONS) {
    const entries = fragments.flatMap(({ sections }) => sections[section] || []);
    const index = blocks.findIndex(({ heading }) => heading === section);

    if (!entries.length) {
      continue;
    } else if (~index) {
      blocks[index] = Object.freeze({
        body: `${blocks[index].body.trimEnd()}\n${entries.join('\n')}`,
        heading: section
      });
    } else {
      const laterIndex = blocks.findIndex(({ heading }) => SECTIONS.indexOf(heading) > SECTIONS.indexOf(section));

      blocks.splice(
        ~laterIndex ? laterIndex : blocks.length,
        0,
        Object.freeze({ body: entries.join('\n'), heading: section })
      );
    }
  }

  const result = joinUnreleased({ ...unreleased, blocks });
  const numEntries =
    countUnreleasedEntries(changelog) + fragments.flatMap(({ sections }) => Object.values(sections).flat()).length;
  const numParsedEntries = countUnreleasedEntries(result);

  if (numParsedEntries !== numEntries) {
    throw new Error(`Keep a Changelog read ${numParsedEntries} entries in "[Unreleased]" instead of ${numEntries}`);
  }

  return result;
}

/**
 * Consumes the fragments committed at HEAD into CHANGELOG.md of the working tree, built from HEAD, and deletes them.
 *
 * @param {string} cwd Path of the Git repository.
 * @returns {Promise<readonly Readonly<{ filename: string }>[]>} The fragments consumed.
 */
async function consume(cwd) {
  const changelogPath = join(cwd, CHANGELOG_FILENAME);
  const fragments = readFragments(cwd);

  await writeFile(
    changelogPath,
    consumeChangelog(await readFile(changelogPath, 'utf8'), fragments, {
      commit: git(cwd, ['rev-parse', 'HEAD']).trim()
    })
  );
  await Promise.all(fragments.map(({ filename }) => rm(join(cwd, FRAGMENT_DIRECTORY, filename))));

  return fragments;
}

async function main() {
  const fragments = await consume(ROOT_PATH);

  console.log(`Fragments merged into ${CHANGELOG_FILENAME} and deleted: ${fragments.length}`);
}

isMain(import.meta) &&
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });

export {
  CHANGELOG_FILENAME,
  consume,
  consumeChangelog,
  countUnreleasedEntries,
  FRAGMENT_DIRECTORY,
  git,
  joinUnreleased,
  readFragments,
  setBuiltFrom,
  splitUnreleased
};
