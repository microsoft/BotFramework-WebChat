/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('click on Adaptive Card input fields should get focused', () =>
    runHTML('transcript.navigation.adaptiveCard.focusInput'));
});
