/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity', () => {
    test('should not show activities history', () => runHTML('hooks.useActivitiesWithHistory.html'));
  });