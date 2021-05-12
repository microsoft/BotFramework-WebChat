/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useRenderAvatar', () => {
  test('should render avatar', () => runHTML('hooks.useRenderAvatar.html'));
});
