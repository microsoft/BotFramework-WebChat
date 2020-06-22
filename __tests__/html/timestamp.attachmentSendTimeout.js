/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('timestamp', () => {
  test('send timeout for attachment should be different', () => runHTMLTest('timestamp.attachmentSendTimeout.html'));
});
