/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('disabling Adaptive Card with inputs field', () => runHTML('accessibility.adaptiveCard.disabled.inputs.html'));
});
