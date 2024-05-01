/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility hacks for Adaptive Cards', () => {
  test('should have role if speak property is set', () => runHTML('accessibility.adaptiveCard.hack.roleMod.html'));
});
