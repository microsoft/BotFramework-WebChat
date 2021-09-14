/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation with NVDA in browse mode', () => {
  test('should focus inside the attachment when ENTER is pressed', () => runHTML('transcript.navigation.focusAttachment.screenReaderPrimaryAction.nvda'));
});
