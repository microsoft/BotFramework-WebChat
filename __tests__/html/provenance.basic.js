/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('provenance', () => {
  test('should display', () => runHTML('provenance.basic.html'));
});
