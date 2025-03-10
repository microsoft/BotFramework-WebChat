/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('conversationStartProperties', () => {
  test('with no locale is sent should get "Hello and welcome!" message.', () =>
    runHTML('conversationStartProperties.noLocaleIsSent.html'));
});
