/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useFocus', () => {
  test('on send box', () => runHTML('useFocus.sendBox.html'));
});
