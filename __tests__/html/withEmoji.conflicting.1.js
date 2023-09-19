/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('withEmoji conflicting scenario 1', () => {
  test('should pass', () => runHTML('withEmoji.conflicting.1.html'));
});
