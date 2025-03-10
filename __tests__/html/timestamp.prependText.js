/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('timestamp', () => {
  test('prepend text', () => runHTML('timestamp.prependText.html'));
});
