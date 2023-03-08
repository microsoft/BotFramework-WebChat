/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('timestamp', () => {
  test('should change grouping on-the-fly', () => runHTML('timestamp.changeGrouping.html'));
});
