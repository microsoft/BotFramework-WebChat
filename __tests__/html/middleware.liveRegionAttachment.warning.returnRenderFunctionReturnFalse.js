/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('attachment for screen reader middleware', () => {
  test('should warn if returning a render function which return false', () =>
    runHTMLTest('middleware.liveRegionAttachment.warning.returnRenderFunctionReturnFalse.html', {
      ignoreConsoleError: true
    }));
});
