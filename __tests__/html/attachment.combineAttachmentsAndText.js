/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Attachment', () => {
  test('with combined attachments and text', () =>
    runHTML('attachment.combineAttachmentsAndText.html'));
});
