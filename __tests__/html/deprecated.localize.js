/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('deprecated <Localize>', () => {
  test('should localize text in navigator language', () => runHTML('deprecated.localize.html'));
  test('should localize text in "en"', () => runHTML('deprecated.localize.html#l=en'));
  test('should localize text in "yue"', () => runHTML('deprecated.localize.html#l=yue'));
});
