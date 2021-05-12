/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('conversationStartProperties', () => {
  test('with locale of invalid type should get "Hello and welcome!" message.', () =>
    runHTML('conversationStartProperties.sendInvalidType.html'));
});
