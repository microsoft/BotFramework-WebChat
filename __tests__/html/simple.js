/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('simple', () => {
  test('should render UI.', () => runHTMLTest('simple.html'));
});
