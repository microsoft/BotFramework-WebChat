/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('scroll to end button should not flash when sending a message', () =>
  runHTML('scrollToEndButton.notFlashy.html'));
