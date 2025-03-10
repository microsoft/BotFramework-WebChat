/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Meta tag for Web Chat', () => {
  test('should contains build variant for ES5', () => runHTML('metaTag.webChat.es5.html'));
});
