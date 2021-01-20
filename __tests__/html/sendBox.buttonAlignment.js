/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('send box button alignment', () => {
  describe.each([
    ['without speech', 0],
    ['with speech', 1]
  ])('%s', (_, webSpeech) => {
    test(', multiline and align to top', () => runHTMLTest(`sendBox.buttonAlignment.html#m=1&a=top&ws=${webSpeech}`));
    test(', multiline and align to bottom', () =>
      runHTMLTest(`sendBox.buttonAlignment.html#m=1&a=bottom&ws=${webSpeech}`));
    test(', multiline and stretch', () => runHTMLTest(`sendBox.buttonAlignment.html#m=1&a=stretch&ws=${webSpeech}`));
    test('and single line', () => runHTMLTest(`sendBox.buttonAlignment.html#m=0&ws=${webSpeech}`));
  });
});
