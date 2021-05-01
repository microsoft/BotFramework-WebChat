/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('after receive hero card, click on new message button should focus on button', () =>
    runHTML('focusManagement.newMessageButton.receiveHeroCard.html'));
});
