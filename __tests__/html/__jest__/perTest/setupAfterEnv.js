require('dotenv/config');
require('global-agent/bootstrap');

const { configureToMatchImageSnapshot } = require('jest-image-snapshot');
const { join } = require('path');

const { browserName, imageSnapshotOptions, timeouts } = require('../constants.json');

expect.extend({
  toMatchImageSnapshot: configureToMatchImageSnapshot({
    ...imageSnapshotOptions,
    customSnapshotsDir: join(
      __dirname,
      browserName === 'chrome-docker' ? '../../__image_snapshots__/' : '../../__image_snapshots__.local/'
    )
  })
});

jest.setTimeout(timeouts.test);

require('./setupRunHTMLTest');
