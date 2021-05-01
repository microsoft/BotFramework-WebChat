/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('carousel navigation', () => {
  describe('should focus on card button when present', () => {
    test('carousel', () => runHTML('carousel.navigation.tab.cardInput.html'));
  });
});
