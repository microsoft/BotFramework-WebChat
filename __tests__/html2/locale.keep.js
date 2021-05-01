/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('locale', () => {
  test('should keep sending "yue-Hant" to bot while displaying "yue" and able to change it on-the-fly.', () =>
    runHTML('locale.keep.html'));
});
