/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('styleOptions.bubbleImageHeight', () => {
  test('should resize images with deprecation', () =>
    runHTML('styleOptions/bubbleImageHeight/bubbleImageHeight.deprecated'));
});
