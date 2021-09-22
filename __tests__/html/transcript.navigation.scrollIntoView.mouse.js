/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation when focusing on transcript using mouse', () => {
  test('should not scroll focused activity into view', () =>
    runHTML('transcript.navigation.scrollIntoView.mouse'));
});
