/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('new message button', () => {
  test('container size', () => runHTML('newMessageButton.containerSize.html'));
});
