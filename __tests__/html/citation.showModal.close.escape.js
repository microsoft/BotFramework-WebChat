/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('citation modal dialog', () => {
  test('should close when escape key is pressed', () => runHTML('citation.showModal.close.escape.html'));
});
