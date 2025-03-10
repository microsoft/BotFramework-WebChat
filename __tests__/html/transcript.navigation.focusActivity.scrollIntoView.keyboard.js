/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript navigation', () => {
  test('should scroll into view after pressing TAB key', () => runHTML('transcript.navigation.focusActivity.scrollIntoView.keyboard'));
});
