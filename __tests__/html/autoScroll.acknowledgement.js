/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Auto-scroll acknowledgement logic', () => {
  test('should acknowledge activities correctly', () => runHTML('autoScroll.acknowledgement.html'));
});
