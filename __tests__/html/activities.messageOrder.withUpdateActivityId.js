/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activity', () => {
    test('should not show correct activities order', () => runHTML('activities.messageOrder.withUpdateActivityId.html'));
  });