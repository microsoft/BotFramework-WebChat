/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('suggested actions', () => {
  test('should be focusable using access key.', () => runHTMLTest('suggestedActions.accessKey.html'));
});
