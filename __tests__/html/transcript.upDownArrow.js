/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('Transcript of <BasicWebChat>', () => {
  test('should handle/ignore arrow keys to scroll the transcript', () => runHTMLTest('transcript.upDownArrow.html'));
});
