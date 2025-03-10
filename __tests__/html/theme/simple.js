/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('theme applied outside of Web Chat', () => {
  test('should be applied inside Web Chat', () => runHTML('theme/simple'));
});
