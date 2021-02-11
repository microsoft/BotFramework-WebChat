/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript navigation', () => {
  test('should activate activity and focus on card', () =>
    runHTMLTest('transcript.navigation.activateActivity.focusCard'));
});
