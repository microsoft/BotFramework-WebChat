/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('middleware to disable obsolete Adaptive Cards', () => {
  test('should NOT disable anchors', () => runHTML('middleware.obsoleteAdaptiveCard.anchor.html'));
});
