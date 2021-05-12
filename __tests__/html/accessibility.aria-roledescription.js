/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('All DOM elements with `aria-roledescription` must have an explicit role', () =>
    runHTML('accessibility.aria-roledescription'));
});
