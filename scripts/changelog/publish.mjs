/// <reference types="node" />

// Recreates the `changelog-unreleased` branch from HEAD (the pushed `main` commit): one commit that merges the fragments
// into CHANGELOG.md and deletes them, or HEAD itself when there are no fragments. The branch is always `main` plus at
// most one commit, so it can be merged back cleanly. Used by the "Publish changelog-unreleased" workflow.
//
// Usage:
//   node ./scripts/changelog/publish.mjs [--branch changelog-unreleased] [--remote origin]

import { parseArgs } from 'util';
import { CHANGELOG_FILENAME, consume, FRAGMENT_DIRECTORY, git } from './consume.mjs';
import { isMain } from './fragment.mjs';

const MESSAGE = `Merge ${FRAGMENT_DIRECTORY}/ into ${CHANGELOG_FILENAME}`;

/**
 * @param {string} cwd Path of the Git repository, with HEAD checked out and a clean working tree.
 * @param {Readonly<{ branch: string, remote: string }>} init
 * @returns {Promise<Readonly<{ commit: string, numFragments: number }>>} `commit` is what the branch now points to.
 */
async function publish(cwd, { branch, remote }) {
  git(cwd, ['checkout', '--quiet', '-B', branch]);

  const { length: numFragments } = await consume(cwd);

  if (numFragments) {
    git(cwd, ['add', '--all', '--', CHANGELOG_FILENAME, FRAGMENT_DIRECTORY]);
    git(cwd, ['commit', '--no-verify', '--quiet', '--message', MESSAGE]);
  }

  // Always pushed and recreated from HEAD, never appended to, so a deleted branch is created again. Git skips the push
  // when the branch already points at HEAD.
  git(cwd, ['push', '--force', '--quiet', remote, `HEAD:refs/heads/${branch}`]);

  return Object.freeze({ commit: git(cwd, ['rev-parse', 'HEAD']).trim(), numFragments });
}

async function main() {
  const {
    values: { branch, remote }
  } = parseArgs({
    options: {
      branch: { default: 'changelog-unreleased', type: 'string' },
      remote: { default: 'origin', type: 'string' }
    }
  });

  const { commit, numFragments } = await publish(process.cwd(), { branch, remote });

  console.log(
    numFragments
      ? `Fragments merged into ${CHANGELOG_FILENAME}: ${numFragments}, pushed ${commit} to ${branch}, one commit ahead of the current commit`
      : `No fragments, pushed the current commit ${commit} to ${branch}`
  );
}

isMain(import.meta) &&
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });

export { publish };
