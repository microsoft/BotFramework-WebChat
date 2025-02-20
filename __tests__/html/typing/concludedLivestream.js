/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('bot reusing concluded livestream session ID', () => {
  test('should be ignored', () => runHTML('typing/concludedLivestream'));
});
