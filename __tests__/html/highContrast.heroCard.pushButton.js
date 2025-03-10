/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('In high contrast mode', () => {
  test('hero card with buttons pushed should be highlighted', () => runHTML('highContrast.heroCard.pushButton.html'));
});
