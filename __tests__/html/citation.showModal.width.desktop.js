/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('citation modal dialog', () => {
  test('should show 60% on desktop', () => runHTML('citation.showModal.width.desktop.html'));
});
