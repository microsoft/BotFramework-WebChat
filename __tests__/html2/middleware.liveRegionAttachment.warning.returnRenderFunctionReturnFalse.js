/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('attachment for screen reader middleware', () => {
  test('should warn if returning a render function which return false', () =>
    runHTML('middleware.liveRegionAttachment.warning.returnRenderFunctionReturnFalse.html'));
});
