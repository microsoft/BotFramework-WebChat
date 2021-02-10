/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('DirectLine', () => {
  test('should set user ID if setUserID function is provided', () => runHTMLTest('directLine.setUserId.html'));
});
