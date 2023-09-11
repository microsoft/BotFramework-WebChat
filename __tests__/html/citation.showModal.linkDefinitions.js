/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('citation modal dialog', () => {
  test('should show when clicking on citation in link definitions', () => runHTML('citation.showModal.linkDefinitions.html'));
});
