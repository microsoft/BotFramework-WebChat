/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('transcript navigation using useObserveTranscriptFocus hook', () => {
  test('should observe transcript focus', () =>
    runHTMLTest('transcript.navigation.useObserveTranscriptFocus'));
});
