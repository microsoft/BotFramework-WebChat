/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('conversationStartProperties', () => {
  test('with locale of invalid type should get "Hello and welcome!" message.', () =>
    runHTML('conversationStartProperties.sendInvalidType.html'));
});
