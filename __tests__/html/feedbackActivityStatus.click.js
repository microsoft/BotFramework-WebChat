/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('vote button', () => {
  test('should send event on click', () => runHTML('feedbackActivityStatus.click.html'));
});
