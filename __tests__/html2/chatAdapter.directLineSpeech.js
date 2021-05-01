/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('Direct Line Speech chat adapter', () => {
  test('should connect to the MockBot.', () => runHTML('chatAdapter.directLineSpeech.html'));
});
