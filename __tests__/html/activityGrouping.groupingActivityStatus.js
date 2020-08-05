/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('activity grouping', () => {
  test('should group activity status after activities being sent', () =>
    runHTMLTest('activityGrouping.groupingActivityStatus.html', { height: 1280 }));
});
