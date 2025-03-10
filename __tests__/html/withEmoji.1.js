/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('withEmoji scenario 1', () => {
  test('should pass', () => runHTML('withEmoji.1.html'));
});
