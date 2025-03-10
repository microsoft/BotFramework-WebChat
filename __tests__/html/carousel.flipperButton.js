/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Carousel', () => {
  test('should scroll when flipper button is clicked', () =>
    runHTML('carousel.flipperButton.html'));
});
