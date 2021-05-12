/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('send box button alignment', () => {
  describe.each([
    ['without speech', 0],
    ['with speech', 1]
  ])('%s', (_, webSpeech) => {
    test(', multiline and align to top', () => runHTML(`sendBox.buttonAlignment.html#m=1&a=top&ws=${webSpeech}`));
    test(', multiline and align to bottom', () => runHTML(`sendBox.buttonAlignment.html#m=1&a=bottom&ws=${webSpeech}`));
    test(', multiline and stretch', () => runHTML(`sendBox.buttonAlignment.html#m=1&a=stretch&ws=${webSpeech}`));
    test('and single line', () => runHTML(`sendBox.buttonAlignment.html#m=0&ws=${webSpeech}`));
  });
});
