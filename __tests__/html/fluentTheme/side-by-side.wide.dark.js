/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  describe('dark theme applied', () => {
    test('side by side left - transcript, right - pre chat message', () =>
      runHTML('fluentTheme/side-by-side.wide.dark?focus=1'));
    test('side by side left - transcript, right - transcript', () =>
      runHTML('fluentTheme/side-by-side.wide.dark?transcript=0&transcript=2&focus=0&focus=1'));
    test('side by side left - transcript, right - pre liner', () =>
      runHTML('fluentTheme/side-by-side.wide.dark?transcript=0&transcript=3'));
  });
});
