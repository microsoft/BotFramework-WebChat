/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('activity grouping', () => {
  test('should not break legacy activity status middleware', () =>
    runHTMLTest('activityGrouping.legacyActivityStatusMiddleware.html', { height: 1280 }));
});
