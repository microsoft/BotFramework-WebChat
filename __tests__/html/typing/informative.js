/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('informative typing message', () => {
  test('should be shown as typing indicator', () => runHTML('typing/informative'));
});
