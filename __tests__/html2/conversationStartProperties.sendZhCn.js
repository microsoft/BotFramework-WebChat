/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('conversationStartProperties', () => {
  test('with locale of zh-CN should get "Hello and welcome!" in Simplified Chinese.', () =>
    runHTML('conversationStartProperties.sendZhCn.html'));
});
