/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('styleOptions.bubbleImageMinMaxHeight', () => {
  test('should resize images properly', () =>
    runHTML('styleOptions/bubbleImageHeight/bubbleImageHeight.comprehensive'));
});
