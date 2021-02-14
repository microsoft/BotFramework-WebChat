/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript navigation', () => {
  test('click on Adaptive Card input fields should get focused', () =>
    runHTMLTest('transcript.navigation.adaptiveCard.focusInput'));
});
