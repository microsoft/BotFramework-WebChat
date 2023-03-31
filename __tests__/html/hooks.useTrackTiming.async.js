/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTrackTiming', () => {
  test('should work with asynchronous functions', () => runHTML('hooks.useTrackTiming.async.html'));
});
