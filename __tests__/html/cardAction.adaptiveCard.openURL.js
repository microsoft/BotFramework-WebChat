/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('"openUrl" action on Adaptive Card', () => {
  test('should open URL in a new tab with "noopener" and "noreferrer"', () =>
    runHTMLTest('cardAction.adaptiveCard.openURL.html'));
});
