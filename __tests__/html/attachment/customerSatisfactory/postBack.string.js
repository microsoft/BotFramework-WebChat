/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('customer satisfactory attachment with postBack of string', () => {
  test('should work', () => runHTML('attachment/customerSatisfactory/postBack.string'));
});
