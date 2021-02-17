/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript navigation', () => {
  test('should show visual keyboard indicators', () => runHTMLTest('transcript.navigation.visualKeyboardIndicator'));
});
