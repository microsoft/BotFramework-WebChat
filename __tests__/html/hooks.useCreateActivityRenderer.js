/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useCreateActivityRenderer', () => {
  test('should render activity', () => runHTML('hooks.useCreateActivityRenderer.html'));
});
