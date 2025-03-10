/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('withEmoji conflicting scenario 2', () => {
  test('should pass', () => runHTML('withEmoji.conflicting.2.html'));
});
