/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('activity grouping', () => {
  test('should not break legacy activity middleware', () =>
    runHTMLTest('activityGrouping.legacyActivityMiddleware.html', { height: 1280 }));
});
