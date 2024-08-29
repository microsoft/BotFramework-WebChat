/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('upload a zip file with contentURL', () => {
  test('should send', () => runHTML('upload/uploadZipFileWithContentURL'));
});
