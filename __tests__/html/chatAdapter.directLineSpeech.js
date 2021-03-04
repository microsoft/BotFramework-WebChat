/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('Direct Line Speech chat adapter', () => {
  test('should connect to the MockBot.', () => runHTMLTest('chatAdapter.directLineSpeech.html'));
});
