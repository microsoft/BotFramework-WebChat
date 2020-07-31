/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('useScrollTo hook', () => {
  test('should scroll based on activity ID', () => runHTMLTest('hooks.useScrollTo.activityID.html'));
});
