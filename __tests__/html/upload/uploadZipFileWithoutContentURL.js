/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('upload a zip file without contentURL', () => {
  test('should send', () => runHTML('upload/uploadZipFileWithoutContentURL'));
});
