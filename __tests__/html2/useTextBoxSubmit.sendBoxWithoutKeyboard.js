/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

test('useTextBoxSubmit and set focus to "sendBoxWithoutKeyboard"', () =>
  runHTML('useTextBoxSubmit.sendBoxWithoutKeyboard.html'));
