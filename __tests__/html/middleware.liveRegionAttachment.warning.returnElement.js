/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('attachment for screen reader middleware', () => {
  test('should warn if returning element', () => runHTML('middleware.liveRegionAttachment.warning.returnElement.html'));
});
