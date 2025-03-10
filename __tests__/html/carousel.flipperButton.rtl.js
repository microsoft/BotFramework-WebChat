/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Carousel in RTL', () => {
  // TODO: [P1] #3898 Un-skip this one after we bump to Chromium 85+.
  test.skip('should scroll when flipper button is clicked', () =>
    runHTML('carousel.flipperButton.rtl.html'));
});
