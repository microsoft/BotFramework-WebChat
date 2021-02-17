/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript navigation', () => {
  test('should save last focused activity', () => runHTMLTest('transcript.navigation.focusActivity.saveFocus'));
});
