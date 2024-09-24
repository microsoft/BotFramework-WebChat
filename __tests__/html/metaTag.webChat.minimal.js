/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Meta tag for Web Chat', () => {
  test('should contains build variant for minimal', () => runHTML('metaTag.webChat.minimal.html'));
});
