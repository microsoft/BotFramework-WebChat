/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  describe.each([
    ['dark', 'fluent'],
    ['dark', 'copilot'],
    ['light', 'fluent'],
    ['light', 'copilot']
  ])('with %s theme and %s variant', (theme, variant) =>
    test('copy button should layout properly', () =>
      runHTML(`fluentTheme/copyButton.layout?${new URLSearchParams({ theme, variant }).toString()}`))
  );
});
