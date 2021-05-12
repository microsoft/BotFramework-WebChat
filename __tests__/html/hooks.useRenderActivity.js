/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useRenderActivity', () => {
  test('should render activity', () => runHTML('hooks.useRenderActivity.html'));
});
