/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript navigation', () => {
  test('should back up when ESCAPE key is pressed', () => runHTML('transcript.navigation.escapeKey'));
});
