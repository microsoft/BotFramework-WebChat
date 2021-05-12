/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('new message button', () => {
  test('tab order', () => runHTML('newMessageButton.tabOrder.html'));
});
