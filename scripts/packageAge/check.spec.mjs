import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { createTestRepository } from '../changelog/testing.mjs';
import { checkRepository } from './check.mjs';

const facility = { afterEach, beforeEach, describe, it };

const NOW = new Date('2026-10-31T12:00:00Z');

/** @param {number} days */
function daysAgo(days) {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * @param {Readonly<Record<string, string | Readonly<Record<string, string>>>>} packages Path to version, or to the entry.
 * @returns {string} A package-lock.json with the packages, resolved from registry.npmjs.org unless specified.
 */
function lock(packages) {
  return JSON.stringify({
    lockfileVersion: 3,
    name: 'root',
    packages: {
      '': { name: 'root', workspaces: ['packages/*'] },
      'node_modules/workspace': { link: true, resolved: 'packages/workspace' },
      'packages/workspace': { version: '0.0.0-0' },
      ...Object.fromEntries(
        Object.entries(packages).map(([path, entry]) => {
          const name = path.slice(path.lastIndexOf('node_modules/') + 'node_modules/'.length);
          const version = typeof entry === 'string' ? entry : entry.version;

          return [
            path,
            {
              resolved: `https://registry.npmjs.org/${name}/-/${name.split('/').pop()}-${version}.tgz`,
              ...(typeof entry === 'string' ? { version } : entry)
            }
          ];
        })
      )
    }
  });
}

/**
 * A fake registry.npmjs.org.
 *
 * @param {Readonly<Record<string, Readonly<Record<string, string>>>>} times Package name to the "time" of its packument.
 * @param {Record<string, number[]>} [failures] Package name to the status codes of its first responses.
 */
function createRegistry(times, failures = {}) {
  const requests = [];

  return Object.freeze({
    fetch: async url => {
      const name = decodeURIComponent(new URL(url).pathname.slice(1));

      requests.push(url);

      return failures[name]?.length
        ? new Response(null, { status: failures[name].shift() })
        : name in times
          ? Response.json({ name, time: { created: '2020-01-01T00:00:00.000Z', ...times[name] } })
          : Response.json({ error: 'Not found' }, { status: 404 });
    },
    requests
  });
}

const REGISTRY_TIMES = Object.freeze({
  '@scope/fresh': { '2.0.0': daysAgo(1) },
  old: { '1.0.0': daysAgo(100), '1.1.0': daysAgo(30) },
  young: { '1.0.0': daysAgo(100), '1.1.0': daysAgo(2) },
  'own-prerelease': { '4.0.1-main.202610300000.abcdef0': daysAgo(1.5) }
});

/**
 * Creates `main` with a package-lock.json, then commits the pull request on top.
 *
 * @param {Readonly<Record<string, string>>} files Files of the pull request.
 */
async function setUp(files) {
  const repository = await createTestRepository();

  await repository.commit('Initial', {
    'package-lock.json': lock({ 'node_modules/old': '1.0.0', 'node_modules/young': '1.0.0' })
  });

  const base = repository.git('rev-parse', 'HEAD');

  await repository.commit('Pull request', files);

  return Object.freeze({ ...repository, base });
}

/**
 * @param {Readonly<{ failures?: Record<string, number[]>, minDays?: number, now?: Date }>} [options]
 */
function check({ failures, minDays = 7, now = NOW } = {}) {
  return async ({ base, path }) => {
    const { fetch, requests } = createRegistry(REGISTRY_TIMES, structuredClone(failures));

    try {
      return { ...(await checkRepository(path, { base, fetch, head: 'HEAD', minDays, now, retryDelay: 0 })), requests };
    } catch (error) {
      return { error, requests };
    }
  };
}

scenario(
  'checking the age of new package versions',
  bdd => {
    bdd
      .given(
        'a pull request that does not change package-lock.json',
        () => setUp({ 'index.js': '' }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should pass', (_, { ok }) => expect(ok).toBe(true))
      .and('should say it is skipped', (_, { report }) =>
        expect(report).toBe(
          '## Package age\n\nSkipped, no lockfile changed (package-lock.json, :(glob)packages/**/package-lock.json).\n'
        )
      )
      .and('should not call the registry', (_, { requests }) => expect(requests).toEqual([]));

    bdd
      .given(
        'a pull request that bumps to versions published 30 days ago',
        () => setUp({ 'package-lock.json': lock({ 'node_modules/old': '1.1.0', 'node_modules/young': '1.0.0' }) }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should pass', (_, { ok }) => expect(ok).toBe(true))
      .and('should look up the new version only', (_, { requests }) =>
        expect(requests).toEqual(['https://registry.npmjs.org/old'])
      )
      .and('should say they are old enough', (_, { report }) =>
        expect(report).toBe(
          '## Package age\n\n1 new versions in `package-lock.json` are from the npm registry.\n\nAll of them were published 7 or more days ago.\n'
        )
      );

    bdd
      .given(
        'a pull request that bumps to versions published 1 to 2 days ago, including our own prerelease',
        () =>
          setUp({
            'package-lock.json': lock({
              'node_modules/@scope/fresh': '2.0.0',
              'node_modules/old': '1.1.0',
              'node_modules/own-prerelease': '4.0.1-main.202610300000.abcdef0',
              'node_modules/young': '1.1.0'
            })
          }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, { ok }) => expect(ok).toBe(false))
      .and('should list the young versions, youngest first, with the fix', (_, { report }) =>
        expect(report).toBe(
          `## Package age

4 new versions in \`package-lock.json\` are from the npm registry.

3 of them were published less than 7 days ago. Consumers that install with a minimum release age of 7 days cannot install them yet:

- \`@scope/fresh@2.0.0\`, published 2026-10-30T12:00:00.000Z, 1.0 days ago
- \`own-prerelease@4.0.1-main.202610300000.abcdef0\`, published 2026-10-30T00:00:00.000Z, 1.5 days ago
- \`young@1.1.0\`, published 2026-10-29T12:00:00.000Z, 2.0 days ago

Run this check again after 2026-11-06T12:00:00.000Z, or redo the change with versions published 7 or more days ago. Versions already in a package-lock.json are kept, so start from the base:

\`\`\`sh
git checkout origin/main -- package-lock.json
npm install --before=2026-10-24
\`\`\`

With \`min-release-age=7\` in \`.npmrc\`, npm 11.10 or later does not need \`--before\`.
`
        )
      )
      .and('should look up a scoped package with an encoded slash', (_, { requests }) =>
        expect(requests).toContain('https://registry.npmjs.org/@scope%2Ffresh')
      );

    bdd
      .given(
        'a pull request that bumps to a version published 2 days ago',
        () => setUp({ 'package-lock.json': lock({ 'node_modules/old': '1.0.0', 'node_modules/young': '1.1.0' }) }),
        ({ remove }) => remove()
      )
      .when('checked again 5 days later', check({ now: new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000) }))
      .then('should pass', (_, { ok }) => expect(ok).toBe(true));

    bdd
      .given(
        'a pull request that bumps to a version published 2 days ago',
        () => setUp({ 'package-lock.json': lock({ 'node_modules/old': '1.0.0', 'node_modules/young': '1.1.0' }) }),
        ({ remove }) => remove()
      )
      .when('checked with a minimum of 1 day', check({ minDays: 1 }))
      .then('should pass', (_, { ok }) => expect(ok).toBe(true));

    bdd
      .given(
        'a pull request that moves a version to another path and adds a version from GitHub',
        () =>
          setUp({
            'package-lock.json': lock({
              'node_modules/from-github': {
                resolved: 'git+ssh://git@github.com/example/from-github.git#0123456',
                version: '1.0.0'
              },
              'node_modules/old': '1.0.0',
              'node_modules/other/node_modules/young': '1.0.0'
            })
          }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should pass', (_, { ok }) => expect(ok).toBe(true))
      .and('should not call the registry', (_, { requests }) => expect(requests).toEqual([]))
      .and('should note the skipped version', (_, { report }) =>
        expect(report).toContain(
          'Skipped 1 versions that are not from the npm registry: `from-github@1.0.0` (`git+ssh://git@github.com/example/from-github.git#0123456`).'
        )
      );

    bdd
      .given(
        'a pull request that adds a young version to the lockfile of a sample',
        () => setUp({ 'samples/package-lock.json': lock({ 'node_modules/young': '1.1.0' }) }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should pass', (_, { ok }) => expect(ok).toBe(true))
      .and('should not call the registry', (_, { requests }) => expect(requests).toEqual([]));

    bdd
      .given(
        'a pull request that adds young versions to the lockfile of a package and to the root one',
        () =>
          setUp({
            'package-lock.json': lock({ 'node_modules/old': '1.1.0', 'node_modules/young': '1.0.0' }),
            'packages/package/package-lock.json': lock({ 'node_modules/young': '1.1.0' })
          }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, { ok }) => expect(ok).toBe(false))
      .and('should list the young version', (_, { report }) =>
        expect(report).toContain('- `young@1.1.0`, published 2026-10-29T12:00:00.000Z, 2.0 days ago')
      )
      .and('should restore only the lockfile with the young version', (_, { report }) =>
        expect(report).toContain('\ngit checkout origin/main -- packages/package/package-lock.json\n')
      );

    bdd
      .given(
        'a pull request that bumps to versions published 30 days ago',
        () => setUp({ 'package-lock.json': lock({ 'node_modules/old': '1.1.0', 'node_modules/young': '1.0.0' }) }),
        ({ remove }) => remove()
      )
      .when('checked while the registry fails twice', check({ failures: { old: [503, 429] } }))
      .then('should pass', (_, { ok }) => expect(ok).toBe(true))
      .and('should have tried 3 times', (_, { requests }) => expect(requests).toHaveLength(3));

    bdd
      .given(
        'a pull request that bumps to versions published 30 days ago',
        () => setUp({ 'package-lock.json': lock({ 'node_modules/old': '1.1.0', 'node_modules/young': '1.0.0' }) }),
        ({ remove }) => remove()
      )
      .when('checked while the registry keeps failing', check({ failures: { old: [503, 503, 503, 503] } }))
      .then('should throw', (_, { error }) =>
        expect(error).toHaveProperty('message', 'GET https://registry.npmjs.org/old returned 503')
      )
      .and('should have tried 3 times', (_, { requests }) => expect(requests).toHaveLength(3));

    bdd
      .given(
        'a pull request that adds a package the registry does not have',
        () => setUp({ 'package-lock.json': lock({ 'node_modules/missing': '1.0.0', 'node_modules/old': '1.0.0' }) }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should throw without retrying', (_, { error, requests }) => {
        expect(error).toHaveProperty('message', 'GET https://registry.npmjs.org/missing returned 404');
        expect(requests).toHaveLength(1);
      });

    bdd
      .given(
        'a pull request that adds a version the registry does not have',
        () => setUp({ 'package-lock.json': lock({ 'node_modules/old': '1.2.0', 'node_modules/young': '1.0.0' }) }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should throw', (_, { error }) =>
        expect(error).toHaveProperty('message', 'old@1.2.0: the registry does not say when it was published')
      );
  },
  facility
);
