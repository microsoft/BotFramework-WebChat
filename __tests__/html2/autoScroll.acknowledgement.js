/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('Auto-scroll acknowledgement logic', () => {
  test('should acknowledge activities correctly', () => runHTML('autoScroll.acknowledgement.html'));
});
