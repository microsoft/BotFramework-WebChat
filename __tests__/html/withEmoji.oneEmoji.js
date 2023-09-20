/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('withEmoji one emoji', () => {
  test('should pass', () => runHTML('withEmoji.oneEmoji.html'));
});
