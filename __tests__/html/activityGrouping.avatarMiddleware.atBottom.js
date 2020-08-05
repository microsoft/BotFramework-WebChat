/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('activity grouping', () => {
  test('should not break avatar middleware with avatar at bottom', () =>
    runHTMLTest('activityGrouping.avatarMiddleware.atBottom.html', { height: 1280 }));
});
