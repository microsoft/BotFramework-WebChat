/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('suggested actions', () => {
  test('when using default style options', () => runHTML('suggestedActions.styleOptions?preset=default'));
  test('when overriding with deprecated style options', () => runHTML('suggestedActions.styleOptions?preset=deprecated'));
  test('when overriding style options', () => runHTML('suggestedActions.styleOptions'));
});
