/// <reference types="node" />

// Checks the changelog of a pull request and previews its entries. A pull request is one of:
//
// - A change: adds `.changelog/<PR#>-<slug>.md` (or is labeled "no-changelog"), and does not edit "[Unreleased]" in
//   CHANGELOG.md or delete fragments.
// - A merge-back of the `changelog-unreleased` branch: deletes fragments, adds none, changes no other files, and its
//   CHANGELOG.md is exactly the one of the base with the deleted fragments merged in, except for the "Built from" line.
// - A hand edit by a maintainer, labeled "changelog-edit", such as a release: may edit CHANGELOG.md and delete fragments.
//
// Every fragment is validated first, whatever the pull request is. Fragments the pull request adds or edits must also link
// their pull request in every entry, with the number of the filename, and must not have placeholders such as "#XXXX".
// Fragments already merged are not checked again, so a mistake there fails neither other pull requests nor publishing.
//
// Usage:
//   node ./scripts/changelog/check.mjs --pr <PR#> [--base <commit>] [--labels <label>,...]
//
// Reads commits only, not the working tree: HEAD is the pull request merged into "--base", as checked out by GitHub
// Actions. "--base" is `origin/main` by default. Prints the preview, or the error, as Markdown for the job summary.

import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import {
  CHANGELOG_FILENAME,
  consumeChangelog,
  CREATE_PULL_REQUEST_FIRST,
  fail,
  FRAGMENT_DIRECTORY,
  getUnreleased,
  git,
  PLACEHOLDER_PATTERN,
  readFragments,
  renderSections,
  REPOSITORY_URL,
  runMain,
  setBuiltFrom
} from './changelog.mjs';

const ROOT_PATH = fileURLToPath(new URL('../../', import.meta.url));
const UNRELEASED_URL = `${REPOSITORY_URL}/blob/changelog-unreleased/CHANGELOG.md#unreleased`;

const EDITED_MESSAGE = `${CHANGELOG_FILENAME}: the "[Unreleased]" section was edited, add a ${FRAGMENT_DIRECTORY}/<PR#>-<slug>.md fragment instead (see ${FRAGMENT_DIRECTORY}/README.md), only the changelog-unreleased branch and maintainers (label "changelog-edit") write entries to ${CHANGELOG_FILENAME}`;

/**
 * Checks that every entry of a fragment links its pull request, the number of the filename, without placeholders.
 *
 * @param {import('./changelog.mjs').Fragment} fragment
 */
function checkPullRequestLinks({ filename, prNumber, sections }) {
  const link = `[#${prNumber}](${REPOSITORY_URL}/pull/${prNumber})`;

  for (const entry of Object.values(sections).flat()) {
    const placeholder = PLACEHOLDER_PATTERN.exec(entry)?.[0];

    if (placeholder) {
      throw new Error(
        `${FRAGMENT_DIRECTORY}/${filename}: "${placeholder}" is a placeholder, ${CREATE_PULL_REQUEST_FIRST}`
      );
    } else if (!entry.includes(link)) {
      throw new Error(
        `${FRAGMENT_DIRECTORY}/${filename}: every entry must link its pull request, "${link}", got "${entry}"`
      );
    }
  }
}

/**
 * Checks the pull request checked out at HEAD of a Git repository, see the top of this file.
 *
 * @param {string} cwd Path of the Git repository.
 * @param {Readonly<{ base: string, changelogEdit: boolean, noChangelog: boolean, prNumber: number }>} init
 * @returns {string} Markdown preview for the job summary.
 */
function checkRepository(cwd, { base, changelogEdit, noChangelog, prNumber }) {
  const baseChangelog = git(cwd, ['show', `${base}:${CHANGELOG_FILENAME}`]);
  const baseFragments = readFragments(cwd, base);
  const changedPaths = git(cwd, ['diff', '--name-only', '--no-renames', '-z', base, 'HEAD'])
    .split('\0')
    .filter(Boolean);
  const changelog = git(cwd, ['show', `HEAD:${CHANGELOG_FILENAME}`]);
  const fragments = readFragments(cwd);

  const filenames = new Set(fragments.map(({ filename }) => filename));
  const baseFilenames = new Set(baseFragments.map(({ filename }) => filename));
  const addedFragments = fragments.filter(({ filename }) => !baseFilenames.has(filename));
  const deletedFragments = baseFragments.filter(({ filename }) => !filenames.has(filename));

  // Validates every fragment, even ones not touched by this pull request.
  consumeChangelog(changelog, fragments);

  fragments
    .filter(({ filename }) => changedPaths.includes(`${FRAGMENT_DIRECTORY}/${filename}`))
    .forEach(checkPullRequestLinks);

  if (changelogEdit) {
    return '## Changelog\n\nEdited by hand, labeled `changelog-edit`.\n';
  } else if (deletedFragments.length) {
    const deletedPaths = deletedFragments.map(({ filename }) => `${FRAGMENT_DIRECTORY}/${filename}`);
    const otherPaths = changedPaths.filter(path => path !== CHANGELOG_FILENAME && !deletedPaths.includes(path));

    // The branch may be built from an older commit than the base, so the "Built from" lines are not compared.
    if (setBuiltFrom(changelog) !== setBuiltFrom(consumeChangelog(baseChangelog, deletedFragments))) {
      throw new Error(
        `Deleted ${deletedPaths.join(', ')}: only merging back the changelog-unreleased branch, or a pull request labeled "changelog-edit", deletes fragments, and ${CHANGELOG_FILENAME} must then be exactly what the branch built`
      );
    } else if (addedFragments.length) {
      throw new Error(
        `Merging back the changelog-unreleased branch must not add fragments, got ${addedFragments.map(({ filename }) => `${FRAGMENT_DIRECTORY}/${filename}`).join(', ')}`
      );
    } else if (otherPaths.length) {
      throw new Error(
        `Merging back the changelog-unreleased branch must only change ${CHANGELOG_FILENAME} and delete fragments, got ${otherPaths.join(', ')}, move them to another pull request`
      );
    }

    return `## Changelog\n\nMerges back the entries of ${deletedPaths.map(path => `\`${path}\``).join(', ')} from the [\`changelog-unreleased\`](${UNRELEASED_URL}) branch:\n\n${renderSections(deletedFragments)}\n`;
  } else if (getUnreleased(changelog) !== getUnreleased(baseChangelog)) {
    throw new Error(EDITED_MESSAGE);
  }

  const otherFragment = addedFragments.find(fragment => fragment.prNumber !== prNumber);
  const ownFragments = fragments.filter(fragment => fragment.prNumber === prNumber);
  const [ownFragment] = ownFragments;

  if (otherFragment) {
    throw new Error(
      `${FRAGMENT_DIRECTORY}/${otherFragment.filename} is not for this pull request, rename it to ${FRAGMENT_DIRECTORY}/${prNumber}-<slug>.md`
    );
  } else if (ownFragments.length > 1) {
    throw new Error(
      `Found ${ownFragments.length} fragments for #${prNumber} (${ownFragments.map(({ filename }) => filename).join(', ')}), use one file per pull request`
    );
  } else if (!ownFragment && !noChangelog) {
    throw new Error(
      `Missing ${FRAGMENT_DIRECTORY}/${prNumber}-<slug>.md, add it with "node ./scripts/changelog/new.mjs", or label the pull request "no-changelog" if it only changes the development environment`
    );
  }

  return ownFragment
    ? `## Changelog\n\nFrom \`${FRAGMENT_DIRECTORY}/${ownFragment.filename}\`, added to [\`${CHANGELOG_FILENAME}\` on the \`changelog-unreleased\` branch](${UNRELEASED_URL}) when merged:\n\n${renderSections([ownFragment])}\n`
    : '## Changelog\n\nNo entries, labeled `no-changelog`.\n';
}

async function main() {
  try {
    const {
      values: { base, labels, pr }
    } = parseArgs({
      options: {
        base: { default: 'origin/main', type: 'string' },
        labels: { default: '', type: 'string' },
        pr: { type: 'string' }
      }
    });

    /^[1-9]\d*$/u.test(pr ?? '') || fail(`--pr must be a pull request number, got "${pr ?? ''}"`);

    const labelNames = labels.split(',');

    process.stdout.write(
      checkRepository(ROOT_PATH, {
        base,
        changelogEdit: labelNames.includes('changelog-edit'),
        noChangelog: labelNames.includes('no-changelog'),
        prNumber: +pr
      })
    );
  } catch (error) {
    // Also on the summary page, where contributors look first.
    process.stdout.write(`## Changelog\n\n~~~text\n${error.message}\n~~~\n`);

    throw error;
  }
}

runMain(import.meta, main);

export { checkRepository };
