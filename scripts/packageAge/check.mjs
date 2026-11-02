/// <reference types="node" />

// Fails if a pull request adds package versions published less than 7 days ago to a package-lock.json. Consumers that
// install with a minimum release age, such as npm's `min-release-age` or `before` settings, cannot install them yet.
// Once the versions are old enough, running the check again passes.
//
// Compares the "packages" of every package-lock.json changed between the merge base of "--base" and "--head". Every
// version that the base does not have is looked up in its registry. Only registry.npmjs.org is supported, versions
// resolved elsewhere (other registries, Git, files) are skipped with a note.
//
// Usage:
//   node ./scripts/packageAge/check.mjs [--base <commit>] [--head <commit>] [--min-days <days>] [--now <date>]
//
// Reads commits only, not the working tree. "--base" is `origin/main` and "--head" is `HEAD` by default. "--min-days" is
// $MIN_RELEASE_AGE_DAYS or 7. "--now" is $PACKAGE_AGE_NOW or the current time, to check as of another time. Prints the
// result as Markdown for the job summary.

import { execFileSync } from 'child_process';
import { parseArgs } from 'util';

const DEFAULT_MIN_DAYS = 7;
const FETCH_TIMEOUT = 30_000;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const NPM_REGISTRY_ORIGIN = 'https://registry.npmjs.org';
const NUM_ATTEMPTS = 3;
const NUM_CONCURRENT_FETCHES = 8;
const RETRY_DELAY = 1_000;

/**
 * @typedef {Readonly<{ name: string, resolved: string, version: string }>} LockedPackage
 * @typedef {LockedPackage & Readonly<{ publishedAt: Date }>} PublishedPackage
 * @typedef {Readonly<{ checked: readonly PublishedPackage[], skipped: readonly LockedPackage[] }>} CheckResult
 */

/**
 * @param {string} cwd
 * @param {readonly string[]} args
 * @returns {string}
 */
function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

/**
 * @param {Readonly<Record<string, Readonly<Record<string, unknown>>>>} packages The "packages" of a package-lock.json.
 * @returns {LockedPackage[]} Packages installed from somewhere, without the root, workspaces and links.
 */
function getLockedPackages(packages) {
  return Object.entries(packages).flatMap(([path, { link, name, resolved, version }]) =>
    path && !link && typeof resolved === 'string' && typeof version === 'string'
      ? [
          Object.freeze({
            name:
              typeof name === 'string' ? name : path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length),
            resolved,
            version
          })
        ]
      : []
  );
}

/**
 * @param {Readonly<Record<string, Readonly<Record<string, unknown>>>>} basePackages
 * @param {Readonly<Record<string, Readonly<Record<string, unknown>>>>} headPackages
 * @returns {LockedPackage[]} Versions in the head that the base does not have at any path, once each.
 */
function findNewPackages(basePackages, headPackages) {
  const baseVersions = new Set(getLockedPackages(basePackages).map(({ name, version }) => `${name}@${version}`));

  return Array.from(
    new Map(
      getLockedPackages(headPackages)
        .filter(({ name, version }) => !baseVersions.has(`${name}@${version}`))
        .map(lockedPackage => [`${lockedPackage.name}@${lockedPackage.version}`, lockedPackage])
    ).values()
  );
}

/**
 * Fetches the time every version of a package was published, from its packument on registry.npmjs.org.
 *
 * @param {string} name
 * @param {Readonly<{ fetch: typeof fetch, retryDelay: number }>} options
 * @returns {Promise<Readonly<Record<string, string>>>}
 */
async function fetchPublishTimes(name, { fetch, retryDelay }) {
  const url = `${NPM_REGISTRY_ORIGIN}/${name.replace('/', '%2F')}`;
  let lastError;

  for (let attempt = 1; attempt <= NUM_ATTEMPTS; attempt++) {
    attempt > 1 && (await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt - 1))));

    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT)
      });

      if (response.ok) {
        const { time } = await response.json();

        return time && typeof time === 'object' ? time : {};
      }

      lastError = new Error(`GET ${url} returned ${response.status}`);

      // Only server errors and throttling are worth another attempt.
      if (response.status < 500 && response.status !== 429) {
        break;
      }
    } catch (error) {
      lastError = new Error(`GET ${url} failed: ${error.message}`);
    }
  }

  throw lastError;
}

/**
 * @template T, U
 * @param {readonly T[]} items
 * @param {(item: T) => Promise<U>} fn
 * @returns {Promise<U[]>} Results in order, with at most `NUM_CONCURRENT_FETCHES` calls at a time.
 */
async function mapConcurrently(items, fn) {
  const results = [];
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: Math.min(NUM_CONCURRENT_FETCHES, items.length) }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex++;

        results[index] = await fn(items[index]);
      }
    })
  );

  return results;
}

/**
 * Looks up when every package from registry.npmjs.org was published, other packages are skipped.
 *
 * @param {readonly LockedPackage[]} lockedPackages
 * @param {Readonly<{ fetch?: typeof fetch, retryDelay?: number }>} [options]
 * @returns {Promise<CheckResult>}
 */
async function lookUpPublishTimes(lockedPackages, { fetch = globalThis.fetch, retryDelay = RETRY_DELAY } = {}) {
  const isFromNPM = ({ resolved }) => resolved.startsWith(`${NPM_REGISTRY_ORIGIN}/`);
  const fromNPM = lockedPackages.filter(isFromNPM);
  const names = Array.from(new Set(fromNPM.map(({ name }) => name)));
  const publishTimesByName = new Map(
    (await mapConcurrently(names, name => fetchPublishTimes(name, { fetch, retryDelay }))).map((times, index) => [
      names[index],
      times
    ])
  );

  return Object.freeze({
    checked: Object.freeze(
      fromNPM.map(lockedPackage => {
        const publishedAt = publishTimesByName.get(lockedPackage.name)[lockedPackage.version];

        if (typeof publishedAt !== 'string') {
          throw new Error(
            `${lockedPackage.name}@${lockedPackage.version}: the registry does not say when it was published`
          );
        }

        return Object.freeze({ ...lockedPackage, publishedAt: new Date(publishedAt) });
      })
    ),
    skipped: Object.freeze(lockedPackages.filter(lockedPackage => !isFromNPM(lockedPackage)))
  });
}

/**
 * @param {Readonly<{ checked: readonly PublishedPackage[], filenames: readonly string[], minDays: number, now: Date, skipped: readonly LockedPackage[] }>} result
 * @returns {Readonly<{ ok: boolean, report: string }>} The report is Markdown.
 */
function formatReport({ checked, filenames, minDays, now, skipped }) {
  const minAge = minDays * MILLISECONDS_PER_DAY;
  const young = checked
    .filter(({ publishedAt }) => now.getTime() - publishedAt.getTime() < minAge)
    .sort((x, y) => y.publishedAt.getTime() - x.publishedAt.getTime());
  const lines = ['## Package age', ''];

  if (!filenames.length) {
    return Object.freeze({ ok: true, report: [...lines, 'Skipped, no package-lock.json changed.', ''].join('\n') });
  }

  lines.push(
    checked.length
      ? `${checked.length} new versions in ${filenames.map(filename => `\`${filename}\``).join(', ')} are from the npm registry.`
      : `No new versions from the npm registry in ${filenames.map(filename => `\`${filename}\``).join(', ')}.`,
    ''
  );

  skipped.length &&
    lines.push(
      `Skipped ${skipped.length} versions that are not from the npm registry: ${skipped
        .map(({ name, resolved, version }) => `\`${name}@${version}\` (\`${resolved}\`)`)
        .join(', ')}.`,
      ''
    );

  if (!young.length) {
    checked.length && lines.push(`All of them were published ${minDays} or more days ago.`, '');

    return Object.freeze({ ok: true, report: lines.join('\n') });
  }

  lines.push(
    `${young.length} of them were published less than ${minDays} days ago. Consumers that install with a minimum release age of ${minDays} days cannot install them yet:`,
    '',
    ...young.map(
      ({ name, publishedAt, version }) =>
        `- \`${name}@${version}\`, published ${publishedAt.toISOString()}, ${((now.getTime() - publishedAt.getTime()) / MILLISECONDS_PER_DAY).toFixed(1)} days ago`
    ),
    '',
    `Run this check again after ${new Date(young[0].publishedAt.getTime() + minAge).toISOString()}, or redo the change with versions published ${minDays} or more days ago. Versions already in package-lock.json are kept, so start from the package-lock.json of the base:`,
    '',
    '```sh',
    'git checkout origin/main -- package-lock.json',
    `npm install --before="$(date -u -d '${minDays} days ago' +%F)"`,
    '```',
    '',
    `npm 11.10 or later can use \`--min-release-age=${minDays}\` instead of \`--before\`.`,
    ''
  );

  return Object.freeze({ ok: false, report: lines.join('\n') });
}

/**
 * @param {string} cwd Path of the Git repository.
 * @param {Readonly<{ base: string, fetch?: typeof fetch, head: string, minDays: number, now: Date, retryDelay?: number }>} options
 * @returns {Promise<Readonly<{ ok: boolean, report: string }>>}
 */
async function checkRepository(cwd, { base, head, minDays, now, ...fetchOptions }) {
  const mergeBase = git(cwd, ['merge-base', base, head]).trim();
  const changes = git(cwd, [
    'diff',
    '--diff-filter=AM',
    '--name-status',
    '--no-renames',
    mergeBase,
    head,
    '--',
    ':(glob)**/package-lock.json'
  ])
    .split('\n')
    .filter(Boolean)
    .map(line => line.split('\t'));
  const readPackages = (commit, filename) => JSON.parse(git(cwd, ['show', `${commit}:${filename}`])).packages ?? {};
  const newPackages = changes.flatMap(([status, filename]) =>
    findNewPackages(status === 'A' ? {} : readPackages(mergeBase, filename), readPackages(head, filename))
  );
  const { checked, skipped } = await lookUpPublishTimes(
    Array.from(new Map(newPackages.map(item => [`${item.name}@${item.version}`, item])).values()),
    fetchOptions
  );

  return formatReport({ checked, filenames: changes.map(([, filename]) => filename), minDays, now, skipped });
}

async function main() {
  const {
    values: {
      base,
      head,
      'min-days': minDays = process.env.MIN_RELEASE_AGE_DAYS || `${DEFAULT_MIN_DAYS}`,
      now = process.env.PACKAGE_AGE_NOW || new Date().toISOString()
    }
  } = parseArgs({
    options: {
      base: { default: 'origin/main', type: 'string' },
      head: { default: 'HEAD', type: 'string' },
      'min-days': { type: 'string' },
      now: { type: 'string' }
    }
  });

  if (!/^\d+(\.\d+)?$/u.test(minDays)) {
    throw new Error(`--min-days must be a number of days, not "${minDays}"`);
  } else if (isNaN(Date.parse(now))) {
    throw new Error(`--now must be a date, such as 2026-10-31T12:00:00Z, not "${now}"`);
  }

  const { ok, report } = await checkRepository(process.cwd(), {
    base,
    head,
    minDays: +minDays,
    now: new Date(now)
  });

  console.log(report);
  ok || (process.exitCode = 1);
}

if (typeof import.meta.main !== 'boolean') {
  throw new Error(`scripts/packageAge needs Node.js 22.18, 24.2, or later, this is Node.js ${process.version}`);
}

import.meta.main &&
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });

export { checkRepository, findNewPackages, formatReport, lookUpPublishTimes };
