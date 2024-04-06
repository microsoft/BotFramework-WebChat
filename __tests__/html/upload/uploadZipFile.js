/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('upload a zip file', () => {
  test('should send', () => runHTML('upload/uploadZipFile'));
});
