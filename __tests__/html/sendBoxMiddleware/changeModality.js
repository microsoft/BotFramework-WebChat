/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxMiddleware', () => {
  test('should change modality based on last activity received', () => runHTML('sendBoxMiddleware/changeModality'));
});
