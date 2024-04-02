/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Attachment', () => {
  test('with allowed file types', () =>
    runHTML('attachment.allowedFileTypes.html'));
});
