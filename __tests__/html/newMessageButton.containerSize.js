/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('new message button', () => {
  test('container size', () => runHTML('newMessageButton.containerSize.html'));
});
