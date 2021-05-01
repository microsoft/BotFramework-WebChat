/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('attachment for screen reader middleware', () => {
  test('should not warn if returning false', () =>
    runHTML('middleware.liveRegionAttachment.noWarning.returnFalse.html'));
});
