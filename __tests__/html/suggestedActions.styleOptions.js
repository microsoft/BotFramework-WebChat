/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('suggested actions', () => {
  test('when using default style options', () => runHTML('suggestedActions.styleOptions?default=true'));
  test('when overriding style options', () => runHTML('suggestedActions.styleOptions'));
});
