require('dotenv/config');
require('global-agent/bootstrap');

const { configureToMatchImageSnapshot } = require('jest-image-snapshot');
const { join } = require('path');

const { browser, imageSnapshotOptions, timeouts } = require('../constants.json');

// We have multple .babelrc files. Some load JSX and some don't.
// For those don't load JSX, we will not setup WebDriver for it.

// Checks if JSX is being transpiled in the current Jest run.
// If JSX is not being transpiled, the require() call will fail with SyntaxError.

function supportJSX() {
  try {
    // We don't need to call the exported function.
    return require('./supportJSX');
  } catch (err) {}
}

supportJSX() && require('./setupTestFramework');

expect.extend({
  toMatchImageSnapshot: configureToMatchImageSnapshot({
    ...imageSnapshotOptions,
    customSnapshotsDir: join(
      __dirname,
      browser === 'chrome-docker' ? '../../__image_snapshots__/' : '../../__image_snapshots__.local/'
    )
  })
});

jest.setTimeout(timeouts.test);
