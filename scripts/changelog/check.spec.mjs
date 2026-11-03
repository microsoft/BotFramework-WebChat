import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import { readFile, writeFile } from 'fs/promises';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { join } from 'path';
import { consume, releaseChangelog } from './changelog.mjs';
import { checkRepository } from './check.mjs';
import { changelog, createTestRepository, fragment } from './testing.mjs';

const facility = { afterEach, beforeEach, describe, it };

const CREATE_PULL_REQUEST_FIRST =
  'create the pull request first ("gh pr create"), then write the fragment with its number, e.g.:\n\n   node ./scripts/changelog/new.mjs --issue 5734 "animation cards showing an empty video player for GIF URLs with a query"';

// Written before the pull request was created.
const PLACEHOLDER_FRAGMENT =
  '### Fixed\n\n- Fixed something, in PR [#XXXX](https://github.com/microsoft/BotFramework-WebChat/pull/XXXX), by [@OEvgeny](https://github.com/OEvgeny)\n';

const EDITED_MESSAGE =
  'CHANGELOG.md: the "[Unreleased]" section was edited, add a .changelog/<PR#>-<slug>.md fragment instead';

/**
 * Creates `main` with an entry in CHANGELOG.md and two fragments, then applies the pull request on top.
 *
 * @param {(repository: Awaited<ReturnType<typeof createTestRepository>>) => Promise<unknown>} pullRequest
 *    Resolves to `{ base }` if the base is not the commit before the pull request.
 */
async function setUp(pullRequest) {
  const repository = await createTestRepository();

  await repository.commit('Initial', {
    '.changelog/README.md': '# Fragments\n',
    'CHANGELOG.md': changelog('Pointer.\n\n### Fixed\n\n- Fixed 0')
  });
  await repository.commit('#1', { '.changelog/1-a.md': fragment(1) });

  const base = await repository.commit('#2', { '.changelog/2-b.md': fragment(2, 'Added') });

  const result = await pullRequest(repository);

  return { ...repository, base: result?.base ?? base };
}

// What the changelog-unreleased branch has.
async function mergeBack({ commit, git, path }) {
  await consume(path);
  git('add', '--all');

  return commit('Merge .changelog/ into CHANGELOG.md', {});
}

function check(init) {
  return ({ base, path }) => {
    try {
      return checkRepository(path, { base, changelogEdit: false, noChangelog: false, prNumber: 10, ...init });
    } catch (error) {
      return error;
    }
  };
}

function editChangelog({ commit, path }, replace, files = {}) {
  return readFile(join(path, 'CHANGELOG.md'), 'utf8').then(content =>
    commit('Edit CHANGELOG.md', { ...files, 'CHANGELOG.md': replace(content) })
  );
}

scenario(
  'checking a pull request',
  bdd => {
    bdd
      .given(
        'a pull request with its fragment',
        () => setUp(({ commit }) => commit('#10', { '.changelog/10-fix.md': fragment(10), 'index.js': '' })),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should preview its entries', (_, preview) =>
        expect(preview).toBe(
          '## Changelog\n\nFrom `.changelog/10-fix.md`, added to [`CHANGELOG.md` on the `changelog-unreleased` branch](https://github.com/microsoft/BotFramework-WebChat/blob/changelog-unreleased/CHANGELOG.md#unreleased) when merged:\n\n### Fixed\n\n- Fixed something, in PR [#10](https://github.com/microsoft/BotFramework-WebChat/pull/10), by [@OEvgeny](https://github.com/OEvgeny)\n'
        )
      );

    bdd
      .given(
        'a pull request without fragment',
        () => setUp(({ commit }) => commit('#10', { 'index.js': '' })),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining('Missing .changelog/10-<slug>.md, add it with'))
      );

    bdd
      .given(
        'a pull request labeled "no-changelog" without fragment',
        () => setUp(({ commit }) => commit('#10', { 'index.js': '' })),
        ({ remove }) => remove()
      )
      .when('checked', check({ noChangelog: true }))
      .then('should say there are no entries', (_, preview) =>
        expect(preview).toBe('## Changelog\n\nNo entries, labeled `no-changelog`.\n')
      );

    bdd
      .given(
        'a pull request with the fragment of another pull request number',
        () => setUp(({ commit }) => commit('#10', { '.changelog/11-fix.md': fragment(11) })),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          '.changelog/11-fix.md is not for this pull request, rename it to .changelog/10-<slug>.md'
        )
      );

    bdd
      .given(
        'a pull request with two fragments',
        () =>
          setUp(({ commit }) =>
            commit('#10', { '.changelog/10-a.md': fragment(10), '.changelog/10-b.md': fragment(10) })
          ),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          'Found 2 fragments for #10 (10-a.md, 10-b.md), use one file per pull request'
        )
      );

    bdd
      .given(
        'a pull request with an invalid fragment',
        () => setUp(({ commit }) => commit('#10', { '.changelog/10-fix.md': '- Fixed a\n' })),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty('message', '10-fix.md:1: entry must be under a "### <section>" heading')
      );

    bdd
      .given(
        'a pull request with a fragment with "#XXXX" instead of its number',
        () =>
          setUp(({ commit }) =>
            commit('#10', {
              '.changelog/10-fix.md': PLACEHOLDER_FRAGMENT
            })
          ),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail and ask to create the pull request first', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          `.changelog/10-fix.md: "#XXXX" is a placeholder, ${CREATE_PULL_REQUEST_FIRST}`
        )
      );

    bdd
      .given(
        'a pull request with a fragment with "#XXXX" instead of an issue number',
        () =>
          setUp(({ commit }) =>
            commit('#10', {
              '.changelog/10-fix.md': fragment(
                10,
                'Fixed',
                'Fixed [#XXXX](https://github.com/microsoft/BotFramework-WebChat/issues/XXXX), something'
              )
            })
          ),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          `.changelog/10-fix.md: "#XXXX" is a placeholder, ${CREATE_PULL_REQUEST_FIRST}`
        )
      );

    bdd
      .given(
        'a pull request with a fragment named "XXXX-<slug>.md"',
        () => setUp(({ commit }) => commit('#10', { '.changelog/XXXX-fix.md': fragment(10) })),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail and ask to create the pull request first', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          `.changelog/XXXX-fix.md: fragment filename must be "<PR#>-<slug>.md", "XXXX" is a placeholder, ${CREATE_PULL_REQUEST_FIRST}`
        )
      );

    bdd
      .given(
        'a pull request with its fragment linking another pull request',
        () => setUp(({ commit }) => commit('#10', { '.changelog/10-fix.md': fragment(9) })),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          '.changelog/10-fix.md: every entry must link its pull request, "[#10](https://github.com/microsoft/BotFramework-WebChat/pull/10)", got "- Fixed something, in PR [#9](https://github.com/microsoft/BotFramework-WebChat/pull/9), by [@OEvgeny](https://github.com/OEvgeny)"'
        )
      );

    bdd
      .given(
        'a pull request with its fragment linking its number to another pull request',
        () =>
          setUp(({ commit }) =>
            commit('#10', {
              '.changelog/10-fix.md': fragment(10).replace('/pull/10)', '/pull/9)') // Text says #10, URL says 9.
            })
          ),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining('every entry must link its pull request'))
      );

    bdd
      .given(
        'a pull request that adds "#XXXX" to the fragment of another pull request',
        () =>
          setUp(({ commit }) =>
            commit('#10', {
              '.changelog/1-a.md': fragment(
                1,
                'Fixed',
                'Fixed [#XXXX](https://github.com/microsoft/BotFramework-WebChat/issues/XXXX), something'
              ),
              '.changelog/10-fix.md': fragment(10)
            })
          ),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          `.changelog/1-a.md: "#XXXX" is a placeholder, ${CREATE_PULL_REQUEST_FIRST}`
        )
      );

    bdd
      .given(
        'a pull request after a fragment with "#XXXX" was merged',
        () =>
          setUp(async ({ commit }) => {
            const base = await commit('#3', { '.changelog/3-c.md': PLACEHOLDER_FRAGMENT });

            await commit('#10', { '.changelog/10-fix.md': fragment(10) });

            return { base };
          }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should pass, the merged fragment is fixed in its own pull request', (_, preview) =>
        expect(preview).toMatch(/^## Changelog\n\nFrom `\.changelog\/10-fix\.md`/u)
      );

    bdd
      .given(
        'a pull request that adds an entry to "[Unreleased]" by hand',
        () =>
          setUp(repository =>
            editChangelog(repository, content => content.replace('- Fixed 0', '- Fixed 0\n- Fixed 10'), {
              '.changelog/10-fix.md': fragment(10)
            })
          ),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail and ask for a fragment', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining(EDITED_MESSAGE))
      );

    bdd
      .given(
        'a pull request that fixes a typo in a released version',
        () =>
          setUp(repository =>
            editChangelog(repository, content => content.replace('Fixed an error', 'Fixed an issue'), {
              '.changelog/10-fix.md': fragment(10)
            })
          ),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should pass', (_, preview) => expect(preview).toMatch(/^## Changelog\n\nFrom `\.changelog\/10-fix\.md`/u));

    bdd
      .given(
        'a pull request that deletes the fragment of another pull request',
        () => setUp(({ commit }) => commit('#10', { '.changelog/1-a.md': null, '.changelog/10-fix.md': fragment(10) })),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          expect.stringContaining(
            'Deleted .changelog/1-a.md: only merging back the changelog-unreleased branch, or a pull request labeled "changelog-edit", deletes fragments'
          )
        )
      );
  },
  facility
);

scenario(
  'checking the merge-back of the changelog-unreleased branch',
  bdd => {
    bdd
      .given(
        'the branch built from the base',
        () => setUp(mergeBack),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should pass and preview the entries merged back', (_, preview) =>
        expect(preview).toBe(
          '## Changelog\n\nMerges back the entries of `.changelog/1-a.md`, `.changelog/2-b.md` from the [`changelog-unreleased`](https://github.com/microsoft/BotFramework-WebChat/blob/changelog-unreleased/CHANGELOG.md#unreleased) branch:\n\n### Added\n\n- Added something, in PR [#2](https://github.com/microsoft/BotFramework-WebChat/pull/2), by [@OEvgeny](https://github.com/OEvgeny)\n\n### Fixed\n\n- Fixed something, in PR [#1](https://github.com/microsoft/BotFramework-WebChat/pull/1), by [@OEvgeny](https://github.com/OEvgeny)\n'
        )
      );

    bdd
      .given(
        'the branch built before another pull request was merged',
        () =>
          setUp(async repository => {
            repository.git('checkout', '--quiet', '-b', 'changelog-unreleased');
            await mergeBack(repository);
            repository.git('checkout', '--quiet', 'main');

            const base = await repository.commit('#12', { '.changelog/12-c.md': fragment(12) });

            repository.git('merge', '--no-ff', '--no-edit', '--quiet', 'changelog-unreleased');

            return { base };
          }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should pass', (_, preview) =>
        expect(preview).toMatch(/^## Changelog\n\nMerges back the entries of `\.changelog\/1-a\.md`/u)
      )
      .and('should ignore the "Built from" line naming a commit older than the base', ({ base, git }) =>
        expect(git('show', 'HEAD:CHANGELOG.md')).toContain(`/commit/${git('rev-parse', `${base}~1`)}).`)
      )
      .and('should keep the fragment of the other pull request', ({ git }) =>
        expect(git('ls-tree', '--name-only', 'HEAD', '.changelog/')).toBe('.changelog/12-c.md\n.changelog/README.md')
      );

    bdd
      .given(
        'the branch with an entry edited by hand',
        () =>
          setUp(async repository => {
            await mergeBack(repository);
            await editChangelog(repository, content => content.replace('Added something', 'Added anything'));
          }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining('Deleted .changelog/1-a.md, .changelog/2-b.md'))
      );

    bdd
      .given(
        'the branch with the "Built from" line changed by hand to a wrong format',
        () =>
          setUp(async repository => {
            await mergeBack(repository);
            await editChangelog(repository, content => content.replace(/^Built from .*$/mu, 'Built from somewhere.'));
          }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining('Deleted .changelog/1-a.md, .changelog/2-b.md'))
      );

    bdd
      .given(
        'the branch with a fragment added',
        () =>
          setUp(async repository => {
            await mergeBack(repository);
            await repository.commit('Add', { '.changelog/10-fix.md': fragment(10) });
          }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          'Merging back the changelog-unreleased branch must not add fragments, got .changelog/10-fix.md'
        )
      );

    bdd
      .given(
        'the branch with other files changed',
        () =>
          setUp(async repository => {
            await mergeBack(repository);
            await repository.commit('Add', { '.changelog/README.md': '# Edited\n', 'index.js': '' });
          }),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail and list the other files', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          'Merging back the changelog-unreleased branch must only change CHANGELOG.md and delete fragments, got .changelog/README.md, index.js, move them to another pull request'
        )
      );
  },
  facility
);

scenario(
  'checking a pull request labeled "changelog-edit"',
  bdd => {
    const release = async repository => {
      await consume(repository.path);
      await writeFile(
        join(repository.path, 'CHANGELOG.md'),
        releaseChangelog(await readFile(join(repository.path, 'CHANGELOG.md'), 'utf8'), {
          date: '2026-11-03',
          version: '4.19.3'
        })
      );
      repository.git('add', '--all');

      await repository.commit('Release 4.19.3', {});
    };

    bdd
      .given(
        'a release labeled "changelog-edit"',
        () => setUp(release),
        ({ remove }) => remove()
      )
      .when('checked', check({ changelogEdit: true }))
      .then('should pass', (_, preview) =>
        expect(preview).toBe('## Changelog\n\nEdited by hand, labeled `changelog-edit`.\n')
      );

    bdd
      .given(
        'a typo fix in "[Unreleased]" labeled "changelog-edit"',
        () => setUp(repository => editChangelog(repository, content => content.replace('- Fixed 0', '- Fixed zero'))),
        ({ remove }) => remove()
      )
      .when('checked', check({ changelogEdit: true }))
      .then('should pass', (_, preview) =>
        expect(preview).toBe('## Changelog\n\nEdited by hand, labeled `changelog-edit`.\n')
      );

    bdd
      .given(
        'an unknown section in "[Unreleased]" labeled "changelog-edit"',
        () =>
          setUp(repository =>
            editChangelog(repository, content =>
              content.replace('### Fixed\n\n- Fixed 0', '### Breaking changes\n\n- 💥 0')
            )
          ),
        ({ remove }) => remove()
      )
      .when('checked', check({ changelogEdit: true }))
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty(
          'message',
          'CHANGELOG.md:11: unknown section "Breaking changes" in "[Unreleased]", use one of: Added, Changed, Removed, Fixed'
        )
      );

    bdd
      .given(
        'an invalid fragment labeled "changelog-edit"',
        () => setUp(({ commit }) => commit('#10', { '.changelog/10-fix.md': '- Fixed a\n' })),
        ({ remove }) => remove()
      )
      .when('checked', check({ changelogEdit: true }))
      .then('should still fail', (_, error) =>
        expect(error).toHaveProperty('message', '10-fix.md:1: entry must be under a "### <section>" heading')
      );

    bdd
      .given(
        'a release not labeled "changelog-edit"',
        () => setUp(release),
        ({ remove }) => remove()
      )
      .when('checked', check())
      .then('should fail', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining('Deleted .changelog/1-a.md, .changelog/2-b.md'))
      );
  },
  facility
);
