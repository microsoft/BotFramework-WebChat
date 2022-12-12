/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('YouTube video player', () => {
  test('should have "sandbox" attribute set', () => runHTML('video.youtube.sandbox.html'));
});
