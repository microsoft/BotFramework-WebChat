/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Meta tag for Direct Line', () => {
  test('should contains build variant for ES5', () => runHTML('metaTag.directLine.es5.html'));
});
