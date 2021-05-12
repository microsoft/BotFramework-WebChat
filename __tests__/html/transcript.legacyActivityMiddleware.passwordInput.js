/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript legacy activity middleware', () => {
  test('password input', () => runHTML('transcript.legacyActivityMiddleware.passwordInput.html'));
});
