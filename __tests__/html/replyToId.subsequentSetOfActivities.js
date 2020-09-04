/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('activities with replyToId', () => {
  test('should render when the predecessor is lost', () => runHTMLTest('replyToId.subsequentSetOfActivities.html'));
});
