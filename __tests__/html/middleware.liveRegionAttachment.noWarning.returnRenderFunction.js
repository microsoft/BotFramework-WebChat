/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('attachment for screen reader middleware', () => {
  test('should not warn if returning a render function which return a React element', () =>
    runHTMLTest('middleware.liveRegionAttachment.noWarning.returnRenderFunction.html'));
});
