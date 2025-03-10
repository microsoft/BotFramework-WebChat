/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('attachment for screen reader middleware', () => {
  test('should not warn if returning a render function which return a React element', () =>
    runHTML('middleware.liveRegionAttachment.noWarning.returnRenderFunction.html'));
});
