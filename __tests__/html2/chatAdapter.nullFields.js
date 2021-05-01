/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('chat adapter', () => {
  test('should render properly if some activity fields are null', () => runHTMLTest('chatAdapter.nullFields.html'));
});
