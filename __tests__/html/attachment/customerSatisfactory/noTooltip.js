/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('customer satisfactory attachment without tooltips', () => {
  test('should work', () => runHTML('attachment/customerSatisfactory/noTooltip'));
});
