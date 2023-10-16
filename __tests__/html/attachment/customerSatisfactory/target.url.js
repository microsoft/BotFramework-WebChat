/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('customer satisfactory attachment', () => {
  test('with target of non-templated URL should work', () => runHTML('attachment/customerSatisfactory/target.url'));
});
