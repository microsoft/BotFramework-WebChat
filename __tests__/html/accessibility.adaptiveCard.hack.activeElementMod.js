/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility hacks for Adaptive Cards', () => {
  test('when rerendered should persist focused element', () => runHTML('accessibility.adaptiveCard.hack.activeElementMod.html'));
});
