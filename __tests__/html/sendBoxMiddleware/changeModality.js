/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('sendBoxMiddlware', () => {
  test('should change modality based on last activity received', () => runHTML('sendBoxMiddleware/changeModality'));
});
