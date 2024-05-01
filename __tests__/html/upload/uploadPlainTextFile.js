/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('upload a plain text file', () => {
  test('should send', () => runHTML('upload/uploadPlainTextFile'));
});
