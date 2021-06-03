/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('scroll to end button should not persist while calling useScrollTo', () =>
  runHTML('scrollToEndButton.persistWhileCallingUseScrollTo.html'));
