/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('transcript legacy activity middleware', () => {
  test('password input', () => runHTML('transcript.legacyActivityMiddleware.passwordInput.html'));
});
