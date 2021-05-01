/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useCreateActivityStatusRenderer', () => {
  test('should render activity status', () => runHTML('hooks.useCreateActivityStatusRenderer.html'));
});
