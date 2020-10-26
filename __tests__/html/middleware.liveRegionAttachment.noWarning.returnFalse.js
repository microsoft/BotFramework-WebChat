/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('attachment for screen reader middleware', () => {
  test('should not warn if returning false', () =>
    runHTMLTest('middleware.liveRegionAttachment.noWarning.returnFalse.html'));
});
