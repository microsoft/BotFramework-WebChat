/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility hacks for Adaptive Cards', () => {
  test('actionSets should not have role="menubar"', () => runHTML('accessibility.adaptiveCard.hack.actionSetShouldNotBeMenuBarMod.html'));
});
