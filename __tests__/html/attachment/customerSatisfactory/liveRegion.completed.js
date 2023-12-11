/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('customer satisfactory attachment with completed action', () => {
  test('live region should work', () => runHTML('attachment/customerSatisfactory/liveRegion.completed'));
});
