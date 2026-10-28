/// <reference types="node" />

// Recreates the `changelog-unreleased` branch of `origin` from HEAD (the pushed `main` commit): one commit that merges
// the fragments into CHANGELOG.md and deletes them, or HEAD itself when there are no fragments. The branch is always
// `main` plus at most one commit, so it can be merged back cleanly. Used by the "Publish changelog-unreleased" workflow.
//
// Usage:
//   node ./scripts/changelog/publish.mjs

import { CHANGELOG_FILENAME, consume, FRAGMENT_DIRECTORY, git, runMain } from './changelog.mjs';

const BRANCH = 'changelog-unreleased';

/**
 * @param {string} cwd Path of the Git repository, with HEAD checked out and a clean working tree.
 * @returns {Promise<Readonly<{ commit: string, numFragments: number }>>} `commit` is what the branch now points to.
 */
async function publish(cwd) {
  git(cwd, ['checkout', '--quiet', '-B', BRANCH]);

  const { length: numFragments } = await consume(cwd);

  if (numFragments) {
    git(cwd, ['add', '--all', '--', CHANGELOG_FILENAME, FRAGMENT_DIRECTORY]);
    git(cwd, [
      'commit',
      '--no-verify',
      '--quiet',
      '--message',
      `Merge ${FRAGMENT_DIRECTORY}/ into ${CHANGELOG_FILENAME}`
    ]);
  }

  // Always pushed and recreated from HEAD, never appended to, so a deleted branch is created again. Git skips the push
  // when the branch already points at HEAD.
  git(cwd, ['push', '--force', '--quiet', 'origin', `HEAD:refs/heads/${BRANCH}`]);

  return Object.freeze({ commit: git(cwd, ['rev-parse', 'HEAD']).trim(), numFragments });
}

async function main() {
  const { commit, numFragments } = await publish(process.cwd());

  console.log(
    numFragments
      ? `Fragments merged into ${CHANGELOG_FILENAME}: ${numFragments}, pushed ${commit} to ${BRANCH}, one commit ahead of the current commit`
      : `No fragments, pushed the current commit ${commit} to ${BRANCH}`
  );
}

runMain(import.meta, main);

export { publish };
