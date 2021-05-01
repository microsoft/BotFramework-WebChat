/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('focus management', () => {
  test('focus should not move after hero card is disable after obsolete', () =>
    runHTML('focusManagement.disableHeroCard.obsolete.html'));
});
