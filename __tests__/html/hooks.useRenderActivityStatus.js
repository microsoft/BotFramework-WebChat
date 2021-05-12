/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useRenderActivityStatus', () => {
  test('should render activity status', () => runHTML('hooks.useRenderActivityStatus.html'));
});
