/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('conversationStartProperties', () => {
  test('with locale of en-US should get "Hello and welcome!" message.', () =>
    runHTML('conversationStartProperties.sendEnUs.html'));
});
