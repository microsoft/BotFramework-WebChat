/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation with Windows Narrator', () => {
  test('should focus inside the attachment when "do primary action" is performed', () => runHTML('transcript.navigation.focusAttachment.screenReaderPrimaryAction.windowsNarrator'));
});
