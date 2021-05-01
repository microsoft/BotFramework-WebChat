/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('conversationStartProperties', () => {
  test('with non-existing locale should get "Hello and welcome!" message.', () =>
    runHTML('conversationStartProperties.sendNonExisting.html'));
});
