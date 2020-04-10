/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('locale', () => {
  test('should keep sending "yue-Hant" to bot while displaying "yue" and able to change it on-the-fly.', () =>
    runHTMLTest('locale.keep.html'));
});
