/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('accessibility requirement', () => {
  describe('after clicking on suggested action', () => {
    test('should send the focus to send box immediately', () => runHTML('accessibility.suggestedActions.sendFocusImmediately.html'));
  });
});
