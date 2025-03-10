/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('conversationStartProperties', () => {
  test('with non-existing locale should get "Hello and welcome!" message.', () =>
    runHTML('conversationStartProperties.sendNonExisting.html'));
});
