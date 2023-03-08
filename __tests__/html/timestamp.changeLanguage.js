/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('timestamp', () => {
  test('should change language on-the-fly', () => runHTML('timestamp.changeLanguage.html'));
});
