/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useRenderAttachment', () => {
  test('should render attachment', () => runHTML('hooks.useRenderAttachment.html'));
});
