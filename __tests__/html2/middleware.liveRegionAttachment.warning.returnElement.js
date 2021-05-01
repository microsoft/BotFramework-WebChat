/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('attachment for screen reader middleware', () => {
  test('should warn if returning element', () => runHTML('middleware.liveRegionAttachment.warning.returnElement.html'));
});
