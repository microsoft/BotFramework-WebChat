/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility hacks for Adaptive Cards', () => {
  test('when rerendered should persist values', () => runHTML('accessibility.adaptiveCard.hack.persistValuesMod.html'));
});
