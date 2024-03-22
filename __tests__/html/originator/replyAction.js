/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('originator using ReplyAction', () => {
  test('should display', () => runHTML('originator/replyAction.html'));
});
