/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTrackTiming', () => {
  test('should work with synchronous functions', () => runHTML('hooks.useTrackTiming.sync.html'));
});
