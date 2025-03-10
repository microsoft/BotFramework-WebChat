/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('disabling Adaptive Card should send focus back to chat history', () =>
    runHTML('accessibility.adaptiveCard.disabled.focus.html'));
});
