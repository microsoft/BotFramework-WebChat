/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('activity', () => {
  test('should not show unknown attachment', () =>
    runHTMLTest('activity.unknownAttachment.html', { ignoreConsoleError: true }));
});
