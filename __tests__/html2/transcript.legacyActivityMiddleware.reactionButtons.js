/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('transcript legacy activity middleware', () => {
  test('reaction buttons', () => runHTML('transcript.legacyActivityMiddleware.reactionButtons.html'));
});
