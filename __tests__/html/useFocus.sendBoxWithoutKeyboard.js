/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useFocus', () => {
  test('on send box without keyboard', () => runHTML('useFocus.sendBoxWithoutKeyboard.html'));
});
