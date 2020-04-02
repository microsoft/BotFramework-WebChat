/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('offline UI', () => {
  test('should display "Network interruption occurred. Reconnecting…" status when connection is interrupted', () =>
    runHTMLTest('offlineUI.networkInterrupt.html'));
});
