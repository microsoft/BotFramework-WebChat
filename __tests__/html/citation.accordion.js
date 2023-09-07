/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('citation accordion', () => {
  test('should expand and collapse on click', () => runHTML('citation.accordion.html'));
});
