/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('attachment for screen reader middleware', () => {
  test('should warn if returning element', () =>
    runHTMLTest('middleware.liveRegionAttachment.warning.returnElement.html', { ignoreConsoleError: true }));
});
