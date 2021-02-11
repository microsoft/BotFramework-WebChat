/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript navigation', () => {
  test('should activate activity by click', () => runHTMLTest('transcript.navigation.activateByClick'));
});
