/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('activities with replyToId', () => {
  test('should render when the predecessor is lost', () => runHTML('replyToId.subsequentSetOfActivities.html'));
});
