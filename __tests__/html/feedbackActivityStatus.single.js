/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('vote button', () => {
  test('should display a single button', () => runHTML('feedbackActivityStatus.single.html'));
});
