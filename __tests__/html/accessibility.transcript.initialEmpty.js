/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('should always have at least one <article> under [role="feed"]', () =>
    runHTML('accessibility.transcript.initialEmpty.html'));
});
