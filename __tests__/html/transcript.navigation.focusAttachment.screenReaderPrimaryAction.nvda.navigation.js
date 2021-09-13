/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation with NVDA in browse mode', () => {
  test('should focus inside the attachment when up/down arrow keys are pressed', () => runHTML('transcript.navigation.focusAttachment.screenReaderPrimaryAction.nvda.navigation'));
});
