/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('Avatar', () => {
  test('with empty initials should leave gutter space', () => runHTMLTest('avatar.emptyInitials.html'));
});
