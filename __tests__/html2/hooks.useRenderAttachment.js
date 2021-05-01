/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('useRenderAttachment', () => {
  test('should render attachment', () => runHTML('hooks.useRenderAttachment.html'));
});
