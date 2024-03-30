/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility hacks for Adaptive Cards', () => {
  test('action should be push button', () => runHTML('accessibility.adaptiveCard.hack.actionShouldBePushButtonMod.html'));
});
