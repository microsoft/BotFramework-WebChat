/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('scroll to end button should persist while calling useScrollTo', () =>
  runHTML('scrollToEndButton.persistWhileCallingUseScrollTo.html'));
