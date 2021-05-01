/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useRenderActivityStatus', () => {
  test('should render activity status', () => runHTML('hooks.useRenderActivityStatus.html'));
});
