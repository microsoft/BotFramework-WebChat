/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('when restoring chat history', () => {
  test('outgoing activities should be marked as sent', () => runHTML('chatHistory.restore.sent.html'));
});
