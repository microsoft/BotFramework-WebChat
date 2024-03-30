/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility hacks for Adaptive Cards', () => {
  test('when disabled should add aria-disabled', () => runHTML('accessibility.adaptiveCard.hack.disabledMod.html'));
});
