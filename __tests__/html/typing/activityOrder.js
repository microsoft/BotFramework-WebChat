/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('bot sending multiple messages', () => {
  test('should sort typing activity in its original order', () => runHTML('typing/activityOrder'));
});
