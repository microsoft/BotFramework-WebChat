/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('withEmoji disabled', () => {
  test('should pass', () => runHTML('withEmoji.noEmoji.html'));
});
