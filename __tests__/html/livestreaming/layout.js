/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Livestreaming', () => {
  test('should layout properly', () => runHTML('livestreaming/layout'));
});
