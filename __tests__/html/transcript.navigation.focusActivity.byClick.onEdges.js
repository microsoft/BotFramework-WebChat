/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should focus activity by click on edges', () => runHTML('transcript.navigation.focusActivity.byClick.onEdges'));
});
