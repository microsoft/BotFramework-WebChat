/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  test('active descendant accessible name should contains "Send failed" for failing activities', () =>
    runHTML('accessibility.accessibleName.activityStatus.sendFailed'));
});
