/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useCreateAvatarRenderer', () => {
  test('should render avatar', () => runHTML('hooks.useCreateAvatarRenderer.html'));
});
