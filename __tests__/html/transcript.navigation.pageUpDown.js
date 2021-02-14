/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript navigation', () => {
  test('should scroll page up and down on keys', () => runHTMLTest('transcript.navigation.pageUpDown'));
});
