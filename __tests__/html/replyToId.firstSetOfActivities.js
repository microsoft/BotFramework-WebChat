/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('first activity with replyToId', () => {
  test('should render immediately', () => runHTML('replyToId.firstSetOfActivities.html'));
});
