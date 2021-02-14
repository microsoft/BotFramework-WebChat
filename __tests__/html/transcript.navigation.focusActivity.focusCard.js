/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript navigation', () => {
  test('should focus activity and focus on card', () =>
    runHTMLTest('transcript.navigation.focusActivity.focusCard'));
});
