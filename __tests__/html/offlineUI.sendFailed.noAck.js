/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('offline UI', () => {
  test('should display "Send failed. Retry" when activity is sent but not acknowledged', () =>
    runHTMLTest('offlineUI.sendFailed.noAck.html'));
});
