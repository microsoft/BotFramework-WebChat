/// <reference types="node" />

// Shared by the scripts: reads the fragments, merges them into the "[Unreleased]" section of CHANGELOG.md, and moves
// "[Unreleased]" into a release.
//
// A fragment is a mini changelog of one pull request, saved as `.changelog/<PR#>-<slug>.md`:
//
//    ### Fixed
//
//    - Fixed [#1](https://github.com/microsoft/BotFramework-WebChat/issues/1), ..., in PR [#2](...), by [@user](...)
//       - Nested bullets are indented by 3 spaces
//
// Entries are published verbatim, they are only sorted into sections. The rest of CHANGELOG.md is kept as is, which
// the keep-a-changelog package cannot do: it would reformat the whole file. The scripts use Node.js built-ins only.

import { execFileSync } from 'child_process';
import { readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';

// Matches the "Built from" line with the empty lines after it.
const BUILT_FROM_PATTERN = /^Built from \[`[\da-f]+`\]\(\S+\/commit\/[\da-f]+\)\.\n*/gmu;
const CHANGELOG_FILENAME = 'CHANGELOG.md';
const FRAGMENT_DIRECTORY = '.changelog';
const FRAGMENT_FILENAME_PATTERN = /^([1-9]\d*)-([a-z\d]+(?:-[a-z\d]+)*)\.md$/u;

// A pull request or issue number not known yet, e.g. "#XXXX", "/pull/XXXX", or a filename starting with "XXXX-".
const PLACEHOLDER_PATTERN = /(?:^|#|\/(?:issues|pull)\/)X{4,}\b/iu;

const README_FILENAME = 'README.md';
const REPOSITORY_URL = 'https://github.com/microsoft/BotFramework-WebChat';

// Same order as in CHANGELOG.md, other Keep a Changelog sections are not used.
const SECTIONS = Object.freeze(['Added', 'Changed', 'Removed', 'Fixed']);

// The reference link of "[Unreleased]", comparing the latest release with HEAD.
const UNRELEASED_LINK_PATTERN = /^\[Unreleased\]: (\S+)\/compare\/(\S+?)\.\.\.HEAD$/mu;

// The content of "[Unreleased]", up to the next release.
const UNRELEASED_PATTERN = /^## \[Unreleased\]\n([\s\S]*?)(?=^## \[)/mu;

const CREATE_PULL_REQUEST_FIRST = `create the pull request first ("gh pr create"), then write the fragment with its number, e.g.:

   node ./scripts/changelog/new.mjs --issue 5734 "animation cards showing an empty video player for GIF URLs with a query"`;

/** @typedef {Readonly<{ filename: string, prNumber: number, sections: Readonly<Record<string, readonly string[]>> }>} Fragment */

/** @typedef {readonly (readonly [heading: string, body: string])[]} Sections "### <heading>" blocks, in order. */

/**
 * @param {string} message
 * @returns {never}
 */
function fail(message) {
  throw new Error(message);
}

/**
 * @param {string} cwd Path of the Git repository.
 * @param {readonly string[]} args
 * @returns {string} Output as is.
 */
function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/**
 * Runs `main()` if the script is run directly, not imported, and prints its error. Throws on Node.js versions without
 * `import.meta.main`, where the scripts would silently do nothing.
 *
 * @param {ImportMeta} importMeta `import.meta` of the script.
 * @param {() => Promise<void>} main
 */
function runMain(importMeta, main) {
  if (typeof importMeta.main !== 'boolean') {
    throw new Error(`scripts/changelog needs Node.js 22.18, 24.2, or later, this is Node.js ${process.version}`);
  }

  importMeta.main &&
    main().catch(error => {
      console.error(error.message);
      process.exitCode = 1;
    });
}

/**
 * Parses the filename of a fragment.
 *
 * @param {string} filename Filename without directory, e.g. `5930-fix-animated-image-formats.md`.
 * @returns {Readonly<{ prNumber: number, slug: string }> | undefined} `undefined` if it is not a fragment filename.
 */
function parseFragmentFilename(filename) {
  const match = FRAGMENT_FILENAME_PATTERN.exec(filename);

  return match ? Object.freeze({ prNumber: +match[1], slug: match[2] }) : undefined;
}

/**
 * Parses a fragment into its sections.
 *
 * @param {string} markdown Content of the fragment.
 * @param {string} filename Filename of the fragment, used for the pull request number and in error messages.
 * @returns {Fragment}
 */
function parseFragment(markdown, filename) {
  const parsedFilename = parseFragmentFilename(filename);

  if (!parsedFilename) {
    throw new Error(
      `${filename}: fragment filename must be "<PR#>-<slug>.md", e.g. "5930-fix-animated-image-formats.md"`
    );
  }

  /** @type {Map<string, string[]>} */
  const sections = new Map();

  /** @type {string[] | undefined} */
  let entries;

  for (const [index, line] of markdown.split(/\r?\n/u).entries()) {
    const failAt = message => fail(`${filename}:${index + 1}: ${message}`);

    const text = line.trimEnd();
    const heading = /^### (.*)$/u.exec(text);

    if (!text) {
      continue;
    } else if (heading) {
      const [, section] = heading;

      SECTIONS.includes(section) || failAt(`unknown section "${section}", use one of: ${SECTIONS.join(', ')}`);
      sections.has(section) && failAt(`section "${section}" appears more than once`);

      entries = [];
      sections.set(section, entries);
    } else if (text.startsWith('- ')) {
      entries || failAt('entry must be under a "### <section>" heading');

      entries.push(text);
    } else if (/^\s+\S/u.test(text)) {
      entries?.length || failAt('indented line must follow an entry');
      /^(?: {3})+\S/u.test(text) || failAt('indent nested lines by 3 spaces per level, without tabs');

      entries[entries.length - 1] += `\n${text}`;
    } else {
      failAt(`expected "### <section>", "- <entry>", or an indented line, got "${text}"`);
    }
  }

  sections.size || fail(`${filename}: fragment has no entries`);

  for (const [section, sectionEntries] of sections) {
    sectionEntries.length || fail(`${filename}: section "${section}" has no entries`);
  }

  return Object.freeze({
    filename,
    prNumber: parsedFilename.prNumber,
    sections: Object.freeze(
      Object.fromEntries(Array.from(sections, ([section, sectionEntries]) => [section, Object.freeze(sectionEntries)]))
    )
  });
}

/**
 * Reads the fragments committed at a commit, ordered by the time they were merged, then by pull request number.
 *
 * Only the first parents are followed, so a fragment added on a branch has the time of the merge commit, not of the
 * commit on the branch. Fragments added in the same commit, such as a squash merge, share the same time.
 *
 * @param {string} cwd Path of the Git repository.
 * @param {string} [commit] Commit to read from, `HEAD` by default.
 * @returns {readonly Fragment[]}
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
 * Adds the entries of fragments at the end of their sections, and adds missing sections in the order of `SECTIONS`.
 *
 * @param {Sections} sections
 * @param {readonly Fragment[]} fragments Sorted fragments.
 * @returns {Sections}
 */
function mergeSections(sections, fragments) {
  const merged = [...sections];

  for (const section of SECTIONS) {
    const entries = fragments.flatMap(fragment => fragment.sections[section] || []).join('\n');
    const index = merged.findIndex(([heading]) => heading === section);

    if (!entries) {
      continue;
    } else if (index !== -1) {
      merged[index] = Object.freeze([section, `${merged[index][1].trimEnd()}\n${entries}`]);
    } else {
      const laterIndex = merged.findIndex(([heading]) => SECTIONS.indexOf(heading) > SECTIONS.indexOf(section));

      merged.splice(laterIndex === -1 ? merged.length : laterIndex, 0, Object.freeze([section, entries]));
    }
  }

  return Object.freeze(merged);
}

/**
 * @param {Sections} sections
 * @returns {string} Markdown without trailing newline, or empty string if there are no sections.
 */
function formatSections(sections) {
  return sections.map(([heading, body]) => `### ${heading}\n\n${body.trim()}`).join('\n\n');
}

/**
 * Renders the entries of fragments into sections, in the order of `SECTIONS`, then in the order of fragments.
 *
 * @param {readonly Fragment[]} fragments Sorted fragments.
 * @returns {string} Markdown without trailing newline, or empty string if there are no entries.
 */
function renderSections(fragments) {
  return formatSections(mergeSections([], fragments));
}

/**
 * @param {string} changelog Content of CHANGELOG.md.
 * @returns {string} Content of "[Unreleased]", without its heading.
 */
function getUnreleased(changelog) {
  return (
    UNRELEASED_PATTERN.exec(changelog)?.[1] ??
    fail(`${CHANGELOG_FILENAME}: cannot find "## [Unreleased]" followed by a release`)
  );
}

/**
 * @param {string} changelog Content of CHANGELOG.md.
 * @returns {Readonly<{ preamble: string, sections: Sections }>} `preamble` is the text before the first section, such
 *    as the pointer to the `changelog-unreleased` branch.
 */
function parseUnreleased(changelog) {
  const [preamble, ...blocks] = `\n${getUnreleased(changelog)}`.split(/\n### /u);

  return Object.freeze({
    preamble: preamble.trim(),
    sections: Object.freeze(
      blocks.map(block => {
        const [heading, ...lines] = block.split('\n');

        return Object.freeze(/** @type {const} */ ([heading.trim(), lines.join('\n')]));
      })
    )
  });
}

/**
 * Replaces the content of "[Unreleased]", with one empty line between paragraphs.
 *
 * @param {string} changelog Content of CHANGELOG.md.
 * @param {Readonly<{ preamble: string, sections: Sections }>} unreleased
 * @param {string} [release] Markdown to add after "[Unreleased]", such as a new release.
 * @returns {string} New content of CHANGELOG.md.
 */
function formatUnreleased(changelog, { preamble, sections }, release = '') {
  const content = [preamble.trim(), formatSections(sections)].filter(Boolean).join('\n\n');

  return changelog.replace(
    UNRELEASED_PATTERN,
    () => `## [Unreleased]\n${content ? `\n${content}\n\n` : '\n'}${release}`
  );
}

/**
 * Sets or removes the "Built from" line at the top of "[Unreleased]", there is at most one.
 *
 * @param {string} changelog Content of CHANGELOG.md.
 * @param {string} [commit] Full hash of the commit, `undefined` to remove the line.
 * @returns {string} New content of CHANGELOG.md.
 */
function setBuiltFrom(changelog, commit) {
  if (commit !== undefined && !/^[\da-f]{40}(?:[\da-f]{24})?$/u.test(commit)) {
    throw new Error(`Commit must be a full hash, got "${commit}"`);
  }

  const { preamble, sections } = parseUnreleased(changelog);
  const pointer = preamble.replace(BUILT_FROM_PATTERN, '');

  return formatUnreleased(changelog, {
    preamble: commit
      ? `Built from [\`${commit.slice(0, 7)}\`](${REPOSITORY_URL}/commit/${commit}).\n\n${pointer}`
      : pointer,
    sections
  });
}

/**
 * Adds the entries of fragments at the end of their sections in "[Unreleased]", see `mergeSections()`. Everything else
 * in CHANGELOG.md is kept.
 *
 * @param {string} changelog Content of CHANGELOG.md.
 * @param {readonly Fragment[]} fragments Sorted fragments.
 * @param {Readonly<{ commit?: string | undefined }>} [init] With fragments, `commit` replaces the "Built from" line.
 * @returns {string} New content of CHANGELOG.md.
 */
function consumeChangelog(changelog, fragments, { commit } = {}) {
  const builtChangelog = commit && fragments.length ? setBuiltFrom(changelog, commit) : changelog;
  const { preamble, sections } = parseUnreleased(builtChangelog);

  return formatUnreleased(builtChangelog, { preamble, sections: mergeSections(sections, fragments) });
}

/**
 * Moves the sections of "[Unreleased]" into a new release below it, and updates the reference links at the bottom.
 *
 * @param {string} changelog Content of CHANGELOG.md.
 * @param {Readonly<{ date: string, version: string }>} init
 * @returns {string} New content of CHANGELOG.md.
 */
function releaseChangelog(changelog, { date, version }) {
  const unreleasedChangelog = setBuiltFrom(changelog);
  const { preamble, sections } = parseUnreleased(unreleasedChangelog);
  const unreleasedLink = UNRELEASED_LINK_PATTERN.exec(changelog);

  if (!/^\d+\.\d+\.\d+(?:-[\da-z.-]+)?$/iu.test(version)) {
    throw new Error(`Version must be like 4.19.3, got "${version}"`);
  } else if (!/^\d{4}-\d{2}-\d{2}$/u.test(date) || new Date(date).toISOString().slice(0, 10) !== date) {
    throw new Error(`Date must be like 2026-11-03, got "${date}"`);
  } else if (!sections.some(([, body]) => body.trim())) {
    throw new Error(`No entries to release, "[Unreleased]" in ${CHANGELOG_FILENAME} and .changelog/ are empty`);
  } else if (changelog.includes(`\n## [${version}]`)) {
    throw new Error(`${CHANGELOG_FILENAME} already has ${version}`);
  } else if (!unreleasedLink) {
    throw new Error(`${CHANGELOG_FILENAME}: cannot find "[Unreleased]: <URL>/compare/<tag>...HEAD"`);
  }

  const [, baseURL, previousTag] = unreleasedLink;

  return formatUnreleased(
    unreleasedChangelog,
    { preamble, sections: [] },
    `## [${version}] - ${date}\n\n${formatSections(sections)}\n\n`
  ).replace(
    UNRELEASED_LINK_PATTERN,
    `[Unreleased]: ${baseURL}/compare/v${version}...HEAD\n[${version}]: ${baseURL}/compare/${previousTag}...v${version}`
  );
}

/**
 * Consumes the fragments committed at HEAD into CHANGELOG.md of the working tree, built from HEAD, and deletes them.
 *
 * @param {string} cwd Path of the Git repository.
 * @param {(changelog: string) => string} [transform] Called before anything is written, such as to cut a release.
 * @returns {Promise<readonly Fragment[]>} The fragments consumed.
 */
async function consume(cwd, transform = changelog => changelog) {
  const changelogPath = join(cwd, CHANGELOG_FILENAME);
  const fragments = readFragments(cwd);

  await writeFile(
    changelogPath,
    transform(
      consumeChangelog(await readFile(changelogPath, 'utf8'), fragments, {
        commit: git(cwd, ['rev-parse', 'HEAD']).trim()
      })
    )
  );
  await Promise.all(fragments.map(({ filename }) => rm(join(cwd, FRAGMENT_DIRECTORY, filename))));

  return fragments;
}

export {
  CHANGELOG_FILENAME,
  consume,
  consumeChangelog,
  CREATE_PULL_REQUEST_FIRST,
  fail,
  FRAGMENT_DIRECTORY,
  getUnreleased,
  git,
  parseFragment,
  parseFragmentFilename,
  PLACEHOLDER_PATTERN,
  readFragments,
  releaseChangelog,
  renderSections,
  REPOSITORY_URL,
  runMain,
  SECTIONS,
  setBuiltFrom
};
