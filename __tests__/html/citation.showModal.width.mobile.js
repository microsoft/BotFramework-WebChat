/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('citation modal dialog', () => {
  test('should show full-width on mobile device', () => runHTML('citation.showModal.width.mobile.html'));
});
