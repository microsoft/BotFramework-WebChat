/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useScrollTo hook with updateActivityId', () => {
    test('should scroll based on activity ID when the activity is updated', () => runHTML('hooks.useScrollTo.activityID.withUpdateActivityId.html'));
  });
  