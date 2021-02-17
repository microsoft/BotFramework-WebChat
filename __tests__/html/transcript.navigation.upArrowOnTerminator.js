/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript navigation', () => {
  test('should focus the last activity when press up arrow key on the terminator', () =>
    runHTMLTest('transcript.navigation.upArrowOnTerminator'));
});
