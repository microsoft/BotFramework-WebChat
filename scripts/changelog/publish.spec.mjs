import { scenario } from '@testduet/given-when-then';
import { execFileSync, spawnSync } from 'child_process';
import { expect } from 'expect';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { tmpdir } from 'os';
import { join } from 'path';
import { publish } from './publish.mjs';

const facility = { afterEach, beforeEach, describe, it };

const IDENTITY_ENV = Object.freeze({
  GIT_AUTHOR_EMAIL: 'test@example.com',
  GIT_AUTHOR_NAME: 'Test',
  GIT_COMMITTER_EMAIL: 'test@example.com',
  GIT_COMMITTER_NAME: 'Test'
});

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, ...IDENTITY_ENV } }).trim();
}

scenario(
  'publishing UNRELEASED.md to its own branch',
  bdd => {
    bdd
      .given(
        'a clone of a remote with only a "main" branch',
        async () => {
          const path = await mkdtemp(join(tmpdir(), 'changelog-publish-'));
          const clonePath = join(path, 'clone');
          const remotePath = join(path, 'remote.git');

          git(path, 'init', '--bare', '--initial-branch=main', '--quiet', remotePath);
          git(path, 'clone', '--quiet', remotePath, clonePath);
          await writeFile(join(clonePath, 'README.md'), '# Web Chat\n');
          git(clonePath, 'add', '.');
          git(clonePath, 'commit', '--quiet', '-m', 'Initial commit');
          git(clonePath, 'push', '--quiet', 'origin', 'HEAD:main');

          // The workflow sets the identity via environment variables.
          git(clonePath, 'config', 'user.email', 'test@example.com');
          git(clonePath, 'config', 'user.name', 'Test');

          const publishFile = async content => {
            await writeFile(join(path, 'UNRELEASED.md'), content);

            return publish(clonePath, {
              branch: 'changelog-unreleased',
              message: 'Update',
              path: join(path, 'UNRELEASED.md'),
              remote: 'origin'
            });
          };

          return { path, publishFile, remotePath };
        },
        ({ path }) => rm(path, { force: true, recursive: true })
      )
      .when('published for the first time', ({ publishFile }) => publishFile('# Unreleased changes\n'))
      .then('should create the branch as an orphan with one commit', ({ remotePath }, { commit }) => {
        expect(git(remotePath, 'rev-parse', 'changelog-unreleased')).toBe(commit);
        expect(git(remotePath, 'rev-list', '--count', 'changelog-unreleased')).toBe('1');

        // No common ancestor with "main".
        expect(spawnSync('git', ['merge-base', 'main', 'changelog-unreleased'], { cwd: remotePath }).status).toBe(1);
      })
      .and('should only have UNRELEASED.md', ({ remotePath }) => {
        expect(git(remotePath, 'ls-tree', '--name-only', 'changelog-unreleased')).toBe('UNRELEASED.md');
        expect(git(remotePath, 'show', 'changelog-unreleased:UNRELEASED.md')).toBe('# Unreleased changes');
      })
      .when('published again without changes', ({ publishFile }) => publishFile('# Unreleased changes\n'))
      .then('should not commit', ({ remotePath }, { commit }) => {
        expect(commit).toBeUndefined();
        expect(git(remotePath, 'rev-list', '--count', 'changelog-unreleased')).toBe('1');
      })
      .when('published with changes', ({ publishFile }) => publishFile('# Unreleased changes\n\n### Fixed\n'))
      .then('should add one commit on top', ({ remotePath }, { commit }) => {
        expect(git(remotePath, 'rev-parse', 'changelog-unreleased')).toBe(commit);
        expect(git(remotePath, 'rev-list', '--count', 'changelog-unreleased')).toBe('2');
        expect(git(remotePath, 'show', 'changelog-unreleased:UNRELEASED.md')).toBe('# Unreleased changes\n\n### Fixed');
      })
      .and('should not touch "main"', ({ remotePath }) =>
        expect(git(remotePath, 'log', '--format=%s', 'main')).toBe('Initial commit')
      );
  },
  facility
);
