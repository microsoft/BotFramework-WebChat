/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useCreateAvatarRenderer', () => {
  test('should render avatar', () => runHTML('hooks.useCreateAvatarRenderer.html'));
});
