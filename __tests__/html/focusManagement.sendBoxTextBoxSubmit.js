/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('focus management', () => {
  test('press ENTER on send box text box should continue to focus on send box', () =>
    runHTMLTest('focusManagement.sendBoxTextBoxSubmit.html'));
});
