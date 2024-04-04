/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity middleware hooks', () => {
  test('decorates an activity when used with useRenderAttachment', () => runHTML('./middleware/v2/useRenderAttachment.decorate.html'));
});
