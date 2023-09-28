/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('long provenance', () => {
  test('should display and clipped', () => runHTML('provenance.long.html'));
});
