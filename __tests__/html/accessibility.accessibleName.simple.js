/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('active descendant accessible name should contains simple message content', () =>
    runHTML('accessibility.accessibleName.simple'));
});
