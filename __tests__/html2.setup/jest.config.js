/* eslint-env node */

const { readFileSync } = require('fs');
const { join } = require('path');

// In default mode (`WEBCHAT_TEST_STORE_MODE=default`, Web Chat without Redux, for tests only), the tests listed in
// `../html2/default-mode.txt` run, except those listed in `../html2/redux-only.txt`, which need the Redux store (they run
// in Redux mode only). Lines are globs relative to `__tests__/html2/`, `!` excludes (in default-mode.txt), `#` comments.
function readList(name) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return readFileSync(join(__dirname, '../html2', name), 'utf8')
    .split('\n')
    .map(line => line.replace(/#.*/u, '').trim())
    .filter(Boolean);
}

// Exclusions, as `testPathIgnorePatterns` (Jest does not exclude with "!" in `testMatch`): "**/" is any folders (or
// none), "**" any path, "*" any characters but "/".
function globToPathPattern(glob) {
  const pattern = glob
    .split('**/')
    .map(segment =>
      segment
        .split('**')
        .map(part =>
          part
            .split('*')
            .map(text => text.replace(/[.+?^${}()|[\]\\]/gu, '\\$&'))
            .join('[^/]*')
        )
        .join('.*')
    )
    .join('(?:.*/)?');

  return `/__tests__/html2/${pattern}$`;
}

const defaultMode = process.env.WEBCHAT_TEST_STORE_MODE === 'default';
const defaultModeList = defaultMode
  ? [...readList('default-mode.txt'), ...readList('redux-only.txt').map(glob => `!${glob}`)]
  : [];

module.exports = {
  displayName: { color: 'cyan', name: 'html2' },
  globals: { npm_package_version: '0.0.0-0.jest' },
  moduleFileExtensions: ['html', 'js'], // Will cause fail validation error if 'js' is not included.
  rootDir: '../html2/',
  setupFilesAfterEnv: [
    '<rootDir>/../html2.setup/setupFiles/setupImageSnapshot.js',
    '<rootDir>/../html2.setup/setupFiles/setupTestNightly.js',
    '<rootDir>/../html2.setup/setupFiles/setupTimeout.js'
  ],
  testEnvironment: '<rootDir>/../../packages/test/harness/src/host/jest/WebDriverEnvironment.js', // Cannot load environment in HTML file due to syntax requirements. Jest also ignores environment comment in transformed file.
  testMatch: defaultMode
    ? defaultModeList.filter(glob => !glob.startsWith('!')).map(glob => `<rootDir>/../html2/${glob}`)
    : ['<rootDir>/../html2/**/*.html'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/packages/',
    '<rootDir>/samples/',
    ...defaultModeList.filter(glob => glob.startsWith('!')).map(glob => globToPathPattern(glob.substring(1)))
  ], // Jest will warn obsoleted snapshots outside of "testMatch", need "testPathIgnorePatterns" to skip checking obsoleted snapshots.
  transform: {
    '\\.html$': '<rootDir>/../html2.setup/transformer/htmlTransformer.js'
  }
};
