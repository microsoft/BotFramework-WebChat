const { expect } = require('@jest/globals');
const { configureToMatchImageSnapshot } = require('jest-image-snapshot');

expect &&
  expect.extend({
    toMatchImageSnapshot: configureToMatchImageSnapshot({
      customDiffConfig: {
        threshold: 0.06
      },
      noColors: true
    })
  });
