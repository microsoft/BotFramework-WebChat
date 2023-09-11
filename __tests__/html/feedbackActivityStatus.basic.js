/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('vote button', () => {
  test('should display', () => runHTML('feedbackActivityStatus.basic.html'));
});
