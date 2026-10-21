import { scenario } from '@testduet/given-when-then';
import { execFileSync } from 'child_process';
import { expect } from 'expect';
import { mkdtemp, rm } from 'fs/promises';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { tmpdir } from 'os';
import { join } from 'path';
import { publish } from './publish.mjs';
import { changelog, createTestRepository, fragment } from './testing.mjs';

const facility = { afterEach, beforeEach, describe, it };

const ENTRY_1 =
  '- Fixed something, in PR [#1](https://github.com/microsoft/BotFramework-WebChat/pull/1), by [@OEvgeny](https://github.com/OEvgeny)';
const ENTRY_2 =
  '- Fixed something, in PR [#2](https://github.com/microsoft/BotFramework-WebChat/pull/2), by [@OEvgeny](https://github.com/OEvgeny)';

function builtFrom(commit) {
  return `Built from [\`${commit.slice(0, 7)}\`](https://github.com/microsoft/BotFramework-WebChat/commit/${commit}).`;
}

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trimEnd();
}

/**
 * Creates a bare remote with "main" and the fragment of #1, and a developer clone.
 */
async function setUp() {
  const path = await mkdtemp(join(tmpdir(), 'changelog-publish-'));
  const remotePath = join(path, 'remote.git');
  let numRuns = 0;

  git(path, 'init', '--bare', '--initial-branch=main', '--quiet', remotePath);
  git(path, 'clone', '--quiet', remotePath, join(path, 'developer'));

  const developer = await createTestRepository(join(path, 'developer'));

  await developer.commit('Initial', { '.changelog/README.md': '# Fragments\n', 'CHANGELOG.md': changelog() });
  await developer.commit('#1', { '.changelog/1-a.md': fragment(1) });
  developer.git('push', '--quiet', 'origin', 'HEAD:main');

  // Like the workflow: a fresh clone of "main".
  const runWorkflow = async () => {
    const clonePath = join(path, `run-${++numRuns}`);

    git(path, 'clone', '--quiet', remotePath, clonePath);
    git(clonePath, 'config', 'user.email', 'bot@example.com');
    git(clonePath, 'config', 'user.name', 'Bot');

    return publish(clonePath, { branch: 'changelog-unreleased', remote: 'origin' });
  };

  return { developer, path, remotePath, runWorkflow };
}

function tearDown({ path }) {
  return rm(path, { force: true, recursive: true });
}

scenario(
  'publishing the changelog-unreleased branch',
  bdd => {
    bdd
      .given('a remote with "main" and a fragment', setUp, tearDown)
      .when('published', ({ runWorkflow }) => runWorkflow())
      .then('should be "main" plus one commit', ({ remotePath }, { commit, numFragments }) => {
        expect(numFragments).toBe(1);
        expect(git(remotePath, 'rev-parse', 'changelog-unreleased')).toBe(commit);
        expect(git(remotePath, 'rev-parse', 'changelog-unreleased^')).toBe(git(remotePath, 'rev-parse', 'main'));
      })
      .and('should merge the entry into CHANGELOG.md, built from "main", and delete the fragment', ({ remotePath }) => {
        expect(git(remotePath, 'show', 'changelog-unreleased:CHANGELOG.md')).toContain(
          `## [Unreleased]\n\n${builtFrom(git(remotePath, 'rev-parse', 'main'))}\n\nPointer to the changelog-unreleased branch.\n\n### Fixed\n\n${ENTRY_1}\n\n## [4.19.2]`
        );
        expect(git(remotePath, 'ls-tree', '--name-only', 'changelog-unreleased', '.changelog/')).toBe(
          '.changelog/README.md'
        );
      })
      .when('published again without changes', ({ runWorkflow }) => runWorkflow())
      .then('should recreate the branch, still one commit ahead', ({ remotePath }, { commit }) => {
        expect(git(remotePath, 'rev-parse', 'changelog-unreleased')).toBe(commit);
        expect(git(remotePath, 'rev-list', '--count', 'main..changelog-unreleased')).toBe('1');
      })
      .when('a copy of the branch is squash-merged back and published', async ({ developer, runWorkflow }) => {
        developer.git('fetch', '--quiet', 'origin');
        developer.git('push', '--quiet', 'origin', 'origin/changelog-unreleased:refs/heads/dev/changelog-merge-back');
        developer.git('fetch', '--quiet', 'origin');
        developer.git('merge', '--squash', '--quiet', 'origin/dev/changelog-merge-back');
        await developer.commit('Merge back changelog-unreleased', {});
        developer.git('push', '--quiet', 'origin', 'HEAD:main', ':dev/changelog-merge-back');

        return runWorkflow();
      })
      .then('should point the branch at "main"', ({ remotePath }, { commit, numFragments }) => {
        expect(numFragments).toBe(0);
        expect(commit).toBe(git(remotePath, 'rev-parse', 'main'));
        expect(git(remotePath, 'rev-parse', 'changelog-unreleased')).toBe(commit);
      })
      .when('another fragment is merged and published', async ({ developer, runWorkflow }) => {
        await developer.commit('#2', { '.changelog/2-b.md': fragment(2) });
        developer.git('push', '--quiet', 'origin', 'HEAD:main');

        return runWorkflow();
      })
      .then('should be "main" plus one commit', ({ remotePath }, { numFragments }) => {
        expect(numFragments).toBe(1);
        expect(git(remotePath, 'rev-list', '--count', 'main..changelog-unreleased')).toBe('1');
        expect(git(remotePath, 'rev-parse', 'changelog-unreleased^')).toBe(git(remotePath, 'rev-parse', 'main'));
      })
      .and('should add the new entry after the earlier one', ({ remotePath }) =>
        expect(git(remotePath, 'show', 'changelog-unreleased:CHANGELOG.md')).toContain(
          `### Fixed\n\n${ENTRY_1}\n${ENTRY_2}\n\n## [4.19.2]`
        )
      )
      .and('should replace the "Built from" line with the new "main"', ({ remotePath }) => {
        const content = git(remotePath, 'show', 'changelog-unreleased:CHANGELOG.md');

        expect(content).toContain(`## [Unreleased]\n\n${builtFrom(git(remotePath, 'rev-parse', 'main'))}\n\nPointer`);
        expect(content.match(/^Built from /gmu)).toHaveLength(1);
      });
  },
  facility
);

scenario(
  'publishing after the changelog-unreleased branch was deleted',
  bdd => {
    bdd
      .given(
        'the branch published, then deleted, with no fragments left',
        async () => {
          const repository = await setUp();

          await repository.runWorkflow();
          await repository.developer.commit('Release', { '.changelog/1-a.md': null });
          repository.developer.git('push', '--quiet', 'origin', 'HEAD:main', ':changelog-unreleased');

          return repository;
        },
        tearDown
      )
      .when('published', ({ runWorkflow }) => runWorkflow())
      .then('should recreate the branch at "main"', ({ remotePath }, { commit, numFragments }) => {
        expect(numFragments).toBe(0);
        expect(commit).toBe(git(remotePath, 'rev-parse', 'main'));
        expect(git(remotePath, 'rev-parse', 'changelog-unreleased')).toBe(commit);
      });

    bdd
      .given(
        'the branch published, then deleted, with a fragment left',
        async () => {
          const repository = await setUp();

          await repository.runWorkflow();
          repository.developer.git('push', '--quiet', 'origin', ':changelog-unreleased');

          return repository;
        },
        tearDown
      )
      .when('published', ({ runWorkflow }) => runWorkflow())
      .then('should recreate the branch as "main" plus one commit', ({ remotePath }, { commit, numFragments }) => {
        expect(numFragments).toBe(1);
        expect(git(remotePath, 'rev-parse', 'changelog-unreleased')).toBe(commit);
        expect(git(remotePath, 'rev-parse', 'changelog-unreleased^')).toBe(git(remotePath, 'rev-parse', 'main'));
      });
  },
  facility
);
