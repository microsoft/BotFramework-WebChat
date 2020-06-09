/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('"openUrl" action on hero card', () => {
  test('with a disallowed scheme should not open', () => runHTMLTest('cardAction.heroCard.disallowedScheme.html'));
});
