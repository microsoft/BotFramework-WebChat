/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('click on Adaptive Card input fields should get focused', () =>
    runHTML('transcript.navigation.adaptiveCard.focusInput'));
});
