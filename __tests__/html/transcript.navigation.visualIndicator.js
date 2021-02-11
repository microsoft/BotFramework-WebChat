/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript navigation', () => {
  test('should show visual indicators', () => runHTMLTest('transcript.navigation.visualIndicator'));
});
