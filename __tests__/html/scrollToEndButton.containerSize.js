/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('scroll to end button', () => {
  test('container size', () => runHTML('scrollToEndButton.containerSize.html'));
});
