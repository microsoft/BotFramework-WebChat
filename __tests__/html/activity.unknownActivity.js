/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('activity', () => {
  test('should not show unknown activity', () =>
    runHTMLTest('activity.unknownActivity.html', { ignoreConsoleError: true }));
});
