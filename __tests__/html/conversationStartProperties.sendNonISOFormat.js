/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('conversationStartProperties', () => {
  test('with non ISO format locale should get "Hello and welcome!" message.', () =>
    runHTML('conversationStartProperties.sendNonISOFormat.html'));
});
