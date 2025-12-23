const { configureToMatchImageSnapshot } = require('jest-image-snapshot');

global.expect &&
  global.expect.extend({
    toMatchImageSnapshot: configureToMatchImageSnapshot({
      customDiffConfig: {
        threshold: 0.06
      },
      noColors: true
    })
  });
