import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
import { join } from 'path';

import { browserName, imageSnapshotOptions } from '../constants.json';

global.expect &&
  global.expect.extend({
    toMatchImageSnapshot: configureToMatchImageSnapshot({
      ...imageSnapshotOptions,
      customSnapshotsDir: join(__dirname, '../__image_snapshots__/', browserName)
    })
  });
