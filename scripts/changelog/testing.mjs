/// <reference types="node" />

// Test helper: a temporary Git repository, one commit per day so fragments have distinct merge times.

import { execFileSync } from 'child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { dirname, join } from 'path';

const START_TIME = Date.UTC(2026, 9, 1);

/**
 * @param {string} [path] Where to create the repository, a new temporary directory by default.
 * @returns {Promise<Readonly<{
 *   commit: (message: string, files: Readonly<Record<string, string | null>>) => Promise<string>,
 *   git: (...args: string[]) => string,
 *   path: string,
 *   remove: () => Promise<void>
 * }>>} `commit()` writes files, `null` deletes, and returns the commit hash.
 */
async function createTestRepository(path) {
  const repositoryPath = path ?? (await mkdtemp(join(tmpdir(), 'changelog-')));
  let numCommits = 0;

  const git = (...args) => {
    const date = new Date(START_TIME + numCommits * 24 * 60 * 60 * 1000).toISOString();

    return execFileSync('git', args, {
      cwd: repositoryPath,
      encoding: 'utf8',
      env: {
        ...process.env,
        GIT_AUTHOR_DATE: date,
        GIT_AUTHOR_EMAIL: 'test@example.com',
        GIT_AUTHOR_NAME: 'Test',
        GIT_COMMITTER_DATE: date,
        GIT_COMMITTER_EMAIL: 'test@example.com',
        GIT_COMMITTER_NAME: 'Test'
      }
    }).trimEnd();
  };

  const commit = async (message, files) => {
    for (const [filePath, content] of Object.entries(files)) {
      if (content === null) {
        git('rm', '--quiet', '--', filePath);
      } else {
        await mkdir(dirname(join(repositoryPath, filePath)), { recursive: true });
        await writeFile(join(repositoryPath, filePath), content);
        git('add', '--', filePath);
      }
    }

    numCommits++;
    git('commit', '--allow-empty', '--no-verify', '--quiet', '--message', message);

    return git('rev-parse', 'HEAD');
  };

  path || git('init', '--initial-branch=main', '--quiet');

  return Object.freeze({
    commit,
    git,
    path: repositoryPath,
    remove: () => rm(repositoryPath, { force: true, recursive: true })
  });
}

/**
 * @param {number} prNumber
 * @param {string} [section]
 * @param {string} [text]
 * @returns {string} Content of a fragment with one entry.
 */
function fragment(prNumber, section = 'Fixed', text = `${section} something`) {
  return `### ${section}\n\n- ${text}, in PR [#${prNumber}](https://github.com/microsoft/BotFramework-WebChat/pull/${prNumber}), by [@OEvgeny](https://github.com/OEvgeny)\n`;
}

/**
 * @param {string} [unreleased] Content of the "[Unreleased]" section.
 * @returns {string} Content of a CHANGELOG.md.
 */
function changelog(unreleased = 'Pointer to the changelog-unreleased branch.') {
  return `# Changelog

Legends:

- 💥 are breaking changes

## [Unreleased]

${unreleased}

## [4.19.2] - 2026-10-08

### Fixed

- Fixed an error, in PR [#5848](https://github.com/microsoft/BotFramework-WebChat/pull/5848), by [@OEvgeny](https://github.com/OEvgeny)

[Unreleased]: https://github.com/microsoft/BotFramework-WebChat/compare/v4.19.2...HEAD
[4.19.2]: https://github.com/microsoft/BotFramework-WebChat/compare/v4.19.1...v4.19.2
`;
}

export { changelog, createTestRepository, fragment };
