/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should focus inside the attachment when ENTER key is pressed', () => runHTML('transcript.navigation.focusAttachment.enterKey'));
});
