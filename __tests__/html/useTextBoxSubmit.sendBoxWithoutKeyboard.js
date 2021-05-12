/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('useTextBoxSubmit and set focus to "sendBoxWithoutKeyboard"', () =>
  runHTML('useTextBoxSubmit.sendBoxWithoutKeyboard.html'));
