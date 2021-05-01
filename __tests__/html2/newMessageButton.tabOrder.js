/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('new message button', () => {
  test('tab order', () => runHTML('newMessageButton.tabOrder.html'));
});
