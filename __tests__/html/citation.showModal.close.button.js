/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('citation modal dialog', () => {
  test('should close when clicking on close button', () => runHTML('citation.showModal.close.button.html'));
});
