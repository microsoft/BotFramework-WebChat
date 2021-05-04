/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('middleware to disable obsolete Adaptive Cards', () => {
  test('should NOT disable anchors', () => runHTML('middleware.obsoleteAdaptiveCard.anchor.html'));
});
