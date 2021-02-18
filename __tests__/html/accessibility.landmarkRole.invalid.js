/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility feature to support "role" attribute', () => {
  test('should fallback to "complementary" if not a valid landmark role', () =>
    runHTMLTest('accessibility.landmarkRole.invalid', { ignoreConsoleError: true }));
});
