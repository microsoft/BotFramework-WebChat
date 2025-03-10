/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Direct Line Speech chat adapter', () => {
  test.skip('should connect to the MockBot.', () => runHTML('chatAdapter.directLineSpeech.html'));
});
