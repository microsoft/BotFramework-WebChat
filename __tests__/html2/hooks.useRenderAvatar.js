/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useRenderAvatar', () => {
  test('should render avatar', () => runHTML('hooks.useRenderAvatar.html'));
});
