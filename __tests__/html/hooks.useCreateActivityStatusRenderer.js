/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useCreateActivityStatusRenderer', () => {
  test('should render activity status', () => runHTML('hooks.useCreateActivityStatusRenderer.html'));
});
