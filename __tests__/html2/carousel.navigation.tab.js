/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('carousel navigation', () => {
  test('should show focus when tabbing inside carousel', () => runHTML('carousel.navigation.tab.html'));
});
