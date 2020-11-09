/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('accessibility requirement', () => {
  test('All DOM elements with `aria-roledescription` must have an explicit role', () =>
    runHTMLTest('accessibility.aria-roledescription'));
});
