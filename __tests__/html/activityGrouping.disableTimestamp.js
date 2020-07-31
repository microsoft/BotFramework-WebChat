/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('activity grouping', () => {
  test('should show timestamp even if timestamp is disabled', () =>
    runHTMLTest('activityGrouping.disableTimestamp.html'));
});
