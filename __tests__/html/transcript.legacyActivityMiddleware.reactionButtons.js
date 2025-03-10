/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('transcript legacy activity middleware', () => {
  test('reaction buttons', () => runHTML('transcript.legacyActivityMiddleware.reactionButtons.html'));
});
