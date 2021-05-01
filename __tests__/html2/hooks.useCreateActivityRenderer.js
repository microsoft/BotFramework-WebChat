/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useCreateActivityRenderer', () => {
  test('should render activity', () => runHTML('hooks.useCreateActivityRenderer.html'));
});
