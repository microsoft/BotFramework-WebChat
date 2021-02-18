/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('submitAction on Adaptive Card', () => {
  test('should set aria-pressed to true"', () => runHTMLTest('cardAction.adaptiveCard.submitAction.html'));
});
