/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('Direct Line App Service Service chat adapter', () => {
  test('should connect to the MockBot.', () => runHTMLTest('chatAdapter.directLineAppServiceExtension.html'));
});
