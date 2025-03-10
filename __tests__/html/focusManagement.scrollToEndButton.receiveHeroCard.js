/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('after receive hero card, click on scroll to end button should focus on button', () =>
    runHTML('focusManagement.scrollToEndButton.receiveHeroCard.html'));
});
