/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('send box button', () => {
  test('with different style options', () => runHTML('sendBox.button.styleOptions'));
  test('with default style options', () => runHTML('sendBox.button.styleOptions?default=true'));
});
