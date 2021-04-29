const { configureToMatchImageSnapshot } = require('jest-image-snapshot');
const { join } = require('path');

global.expect &&
  global.expect.extend({
    toMatchImageSnapshot: configureToMatchImageSnapshot({
      customDiffConfig: {
        threshold: 0.14
      },
      customSnapshotsDir: join(__dirname, '../../../../../__tests__/__image_snapshots_2__/'),
      noColors: true
    })
  });
