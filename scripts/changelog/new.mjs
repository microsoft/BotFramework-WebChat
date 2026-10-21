/// <reference types="node" />

// Writes the changelog fragment of a pull request, `.changelog/<PR#>-<slug>.md`. Run it after `gh pr create`.
//
// Usage:
//   node ./scripts/changelog/new.mjs [--section added|changed|removed|fixed] [--issue <issue#>]... [--marker <marker>]
//                                    [--pr <PR#>] [--author <login>] [--slug <slug>] "<description>"
//
// Examples:
//   node ./scripts/changelog/new.mjs --issue 5734 "animation cards showing an empty video player for GIF URLs with a query"
//   node ./scripts/changelog/new.mjs --section added "Carousel: added <kbd>HOME</kbd> and <kbd>END</kbd> keys"
//
// Markers are 💥 (breaking), 🐛 (known-issue), 🧪 (experimental), 🏫 (sample), 👷🏻 (dev), name or emoji.
// To add more entries or sections, edit the fragment after it is written.

import { execFileSync } from 'child_process';
import { mkdir, readdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import {
  CREATE_PULL_REQUEST_FIRST,
  isMain,
  parseFragment,
  parseFragmentFilename,
  REPOSITORY_URL,
  SECTIONS
} from './fragment.mjs';

const FRAGMENT_DIRECTORY_PATH = fileURLToPath(new URL('../../.changelog/', import.meta.url));
const GITHUB_LOGIN_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/iu;
const MAX_SLUG_LENGTH = 50;

const MARKERS = Object.freeze({
  breaking: '💥',
  dev: '👷🏻',
  experimental: '🧪',
  'known-issue': '🐛',
  sample: '🏫'
});

/**
 * Formats issue references, e.g. "[#1](...)", "[#1](...) and [#2](...)", or "[#1](...), [#2](...), and [#3](...)".
 *
 * @param {readonly number[]} issues
 * @returns {string}
 */
function formatIssueReferences(issues) {
  const references = issues.map(issue => `[#${issue}](${REPOSITORY_URL}/issues/${issue})`);

  return references.length > 2
    ? `${references.slice(0, -1).join(', ')}, and ${references.at(-1)}`
    : references.join(' and ');
}

/**
 * Formats an entry, with issue references first:
 *
 * - `- Fixed [#1](...), <description>, in PR [#2](...), by [@user](...)`
 * - `- Fixed <description>, in PR [#2](...), by [@user](...)`
 * - `- Added [#1](...), <description>, in PR [#2](...), by [@user](...)`
 * - `- <description>, in PR [#2](...), by [@user](...)`, e.g. "Carousel: added ..." for added, changed, and removed
 *
 * @param {Readonly<{ author: string, description: string, issues?: readonly number[] | undefined, marker?: string | undefined, prNumber: number, section: string }>} init
 * @returns {string}
 */
function formatEntry({ author, description, issues = [], marker, prNumber, section }) {
  const trimmedDescription = description.trim();

  if (!SECTIONS.includes(section)) {
    throw new Error(`Section must be one of: ${SECTIONS.join(', ')}`);
  } else if (!trimmedDescription || /[\r\n]/u.test(trimmedDescription)) {
    throw new Error('Description must be a single line');
  } else if (section === 'Fixed' && /^fixed\b/iu.test(trimmedDescription)) {
    throw new Error('Description must not start with "Fixed", it is added automatically');
  } else if (!issues.every(issue => Number.isSafeInteger(issue) && issue > 0)) {
    throw new Error('Issues must be issue numbers');
  } else if (new Set(issues).size !== issues.length) {
    throw new Error('Issues must not repeat');
  } else if (marker !== undefined && !Object.values(MARKERS).includes(marker)) {
    throw new Error(`Marker must be one of: ${Object.values(MARKERS).join(' ')}`);
  } else if (!Number.isSafeInteger(prNumber) || prNumber <= 0) {
    throw new Error('PR must be a pull request number');
  } else if (!GITHUB_LOGIN_PATTERN.test(author)) {
    throw new Error(`Author must be a GitHub login, got "${author}"`);
  }

  const references = issues.length ? `${formatIssueReferences(issues)}, ` : '';
  const text =
    section === 'Fixed'
      ? `Fixed ${references}${trimmedDescription}`
      : references
        ? `${section} ${references}${trimmedDescription}`
        : trimmedDescription;

  return `- ${marker ? `${marker} ` : ''}${text}, in PR [#${prNumber}](${REPOSITORY_URL}/pull/${prNumber}), by [@${author}](https://github.com/${author})`;
}

/**
 * Turns a branch name into a slug, e.g. "OEvgeny/fix-animated-image-formats" into "fix-animated-image-formats".
 *
 * @param {string} branch
 * @returns {string} Slug, or empty string if nothing is left.
 */
function toSlug(branch) {
  return branch
    .replace(/^.*\//u, '')
    .toLowerCase()
    .replace(/[^a-z\d]+/gu, '-')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/^-+|-+$/gu, '');
}

/**
 * Writes `<PR#>-<slug>.md` with one entry. Refuses if the pull request already has a fragment.
 *
 * @param {string} directoryPath Path of the `.changelog` directory.
 * @param {Readonly<{ entry: string, prNumber: number, section: string, slug: string }>} init
 * @returns {Promise<string>} Path of the fragment.
 */
async function writeFragment(directoryPath, { entry, prNumber, section, slug }) {
  if (!slug) {
    throw new Error('Cannot make a slug from the branch name, pass --slug');
  }

  await mkdir(directoryPath, { recursive: true });

  const filename = `${prNumber}-${slug}.md`;
  const content = `### ${section}\n\n${entry}\n`;
  const existingFilename = (await readdir(directoryPath)).find(
    name => parseFragmentFilename(name)?.prNumber === prNumber
  );

  if (existingFilename) {
    throw new Error(`.changelog/${existingFilename} already exists, edit it to add more entries`);
  }

  // Validates the filename and the content.
  parseFragment(content, filename);

  const path = join(directoryPath, filename);

  // "wx" fails if the file exists.
  await writeFile(path, content, { flag: 'wx' });

  return path;
}

/**
 * Gets the number and the author of the pull request, from `--pr` and `--author` or from `gh pr view`.
 *
 * @param {Readonly<{ author?: string | undefined, pr?: string | undefined }>} options Command line options.
 * @param {(args: readonly string[]) => string} runGitHubCLI Runs `gh` with the arguments and returns its output.
 * @returns {Readonly<{ author: string, prNumber: number }>}
 */
function getPullRequest({ author, pr }, runGitHubCLI) {
  const view = () => {
    try {
      return runGitHubCLI(['pr', 'view', ...(pr ? [pr] : []), '--json', 'author,number']);
    } catch (error) {
      throw new Error(`Cannot find the pull request with "gh pr view", ${CREATE_PULL_REQUEST_FIRST}`, { cause: error });
    }
  };

  // One call for both, the author is who opened the pull request, not who runs this script.
  const pullRequest = author && pr ? undefined : JSON.parse(view());

  return Object.freeze({ author: author ?? pullRequest.author.login, prNumber: +(pr ?? pullRequest.number) });
}

function run(command, args) {
  return execFileSync(command, args, { encoding: 'utf8' }).trim();
}

async function main() {
  const {
    positionals,
    values: { author, issue: issues, marker, pr, section, slug }
  } = parseArgs({
    allowPositionals: true,
    options: {
      author: { type: 'string' },
      issue: { default: [], multiple: true, type: 'string' },
      marker: { type: 'string' },
      pr: { type: 'string' },
      section: { default: 'fixed', type: 'string' },
      slug: { type: 'string' }
    }
  });

  if (positionals.length !== 1) {
    throw new Error('Pass the description as one argument, e.g. "animation cards showing an empty video player"');
  }

  const sectionName = SECTIONS.find(name => name.toLowerCase() === section.toLowerCase()) || section;
  const { author: login, prNumber } = getPullRequest({ author, pr }, args => run('gh', args));
  const path = await writeFragment(FRAGMENT_DIRECTORY_PATH, {
    entry: formatEntry({
      author: login,
      description: positionals[0],
      issues: issues.map(issue => +issue.replace(/^#/u, '')),
      marker: marker && (MARKERS[marker] || marker),
      prNumber,
      section: sectionName
    }),
    prNumber,
    section: sectionName,
    slug: slug ?? toSlug(run('git', ['branch', '--show-current']))
  });

  console.log(`Wrote ${path}`);
}

isMain(import.meta) &&
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });

export { formatEntry, formatIssueReferences, getPullRequest, MARKERS, toSlug, writeFragment };
