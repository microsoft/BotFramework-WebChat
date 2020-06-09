/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('"openUrl" action on Adaptive Card', () => {
  test('with a disallowed scheme should not open', () => runHTMLTest('cardAction.adaptiveCard.disallowedScheme.html'));
});
