/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('conversationStartProperties', () => {
  test('with no locale is sent should get "Hello and welcome!" message.', () =>
    runHTML('conversationStartProperties.noLocaleIsSent.html'));
});
