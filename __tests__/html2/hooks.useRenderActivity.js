/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useRenderActivity', () => {
  test('should render activity', () => runHTML('hooks.useRenderActivity.html'));
});
