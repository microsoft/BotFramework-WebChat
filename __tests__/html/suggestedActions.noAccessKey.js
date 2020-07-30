/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('suggested actions with access key disabled', () => {
  test('should not have screen reader text related to access key.', () =>
    runHTMLTest('suggestedActions.noAccessKey.html'));
});
