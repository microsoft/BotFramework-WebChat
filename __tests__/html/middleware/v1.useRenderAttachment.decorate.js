/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('V1 activity middleware hooks', () => {
  test('decorates an activity when used with useRenderAttachment', () => runHTML('./middleware/v1.useRenderAttachment.decorate.html'));
});