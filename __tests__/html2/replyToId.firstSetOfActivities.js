/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('first activity with replyToId', () => {
  test('should render immediately', () => runHTML('replyToId.firstSetOfActivities.html'));
});
