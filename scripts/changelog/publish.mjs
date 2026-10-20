/// <reference types="node" />

// Commits a file to a branch that only holds that file, creating the branch as an orphan if it does not exist. Commits
// only when the file changed. Used by the "Publish UNRELEASED.md" workflow.
//
// Usage:
//   node ./scripts/changelog/publish.mjs <file> [--branch changelog-unreleased] [--message <message>] [--remote origin]

import { execFileSync, spawnSync } from 'child_process';
import { basename, resolve } from 'path';
import { parseArgs } from 'util';
import { isMain } from './fragment.mjs';

/**
 * @param {string} cwd Path of the Git repository.
 * @param {Readonly<{ branch: string, message: string, path: string, remote: string }>} init
 * @returns {Readonly<{ commit: string | undefined }>} `commit` is `undefined` when the file did not change.
 */
function publish(cwd, { branch, message, path, remote }) {
  const git = (args, input) => execFileSync('git', args, { cwd, encoding: 'utf8', input }).trim();

  // "--exit-code" exits with 2 when the branch does not exist.
  const { status } = spawnSync('git', ['ls-remote', '--exit-code', '--heads', remote, branch], {
    cwd,
    stdio: 'ignore'
  });

  if (status !== 0 && status !== 2) {
    throw new Error(`git ls-remote ${remote} failed with exit code ${status}`);
  }

  status === 0 && git(['fetch', '--no-tags', remote, `refs/heads/${branch}`]);

  const parent = status === 0 ? git(['rev-parse', 'FETCH_HEAD']) : undefined;
  const tree = git(['mktree'], `100644 blob ${git(['hash-object', '-w', path])}\t${basename(path)}\n`);

  if (parent && git(['rev-parse', `${parent}^{tree}`]) === tree) {
    return Object.freeze({ commit: undefined });
  }

  // No parent means an orphan commit.
  const commit = git(['commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', message]);

  // Not forced: fails if someone else pushed in the meantime.
  git(['push', remote, `${commit}:refs/heads/${branch}`]);

  return Object.freeze({ commit });
}

function main() {
  const {
    positionals,
    values: { branch, message, remote }
  } = parseArgs({
    allowPositionals: true,
    options: {
      branch: { default: 'changelog-unreleased', type: 'string' },
      message: { default: 'Update', type: 'string' },
      remote: { default: 'origin', type: 'string' }
    }
  });

  if (positionals.length !== 1) {
    throw new Error('Usage: node ./scripts/changelog/publish.mjs <file> [--branch <branch>] [--message <message>]');
  }

  const { commit } = publish(process.cwd(), { branch, message, path: resolve(positionals[0]), remote });

  console.log(commit ? `Pushed ${commit} to ${branch}` : `${positionals[0]} did not change, nothing to push`);
}

if (isMain(import.meta)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

export { publish };
