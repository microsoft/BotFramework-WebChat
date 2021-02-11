/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript navigation', () => {
  test('should save last active activity', () => runHTMLTest('transcript.navigation.saveLastActive'));
});
