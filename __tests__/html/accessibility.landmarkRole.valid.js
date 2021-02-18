/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility feature to support "role" attribute', () => {
  test('should set "role" if it is valid landmark role', () =>
    runHTMLTest('accessibility.landmarkRole.valid'));
});
