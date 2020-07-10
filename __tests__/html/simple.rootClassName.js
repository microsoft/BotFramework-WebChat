/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('simple', () => {
  test('should apply "className" prop.', () => runHTMLTest('simple.rootClassName.html'));
});
