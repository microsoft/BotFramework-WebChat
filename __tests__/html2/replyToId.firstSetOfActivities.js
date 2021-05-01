/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('first activity with replyToId', () => {
  test('should render immediately', () => runHTMLTest('replyToId.firstSetOfActivities.html'));
});
