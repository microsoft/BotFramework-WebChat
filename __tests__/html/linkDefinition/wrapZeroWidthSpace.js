/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('link definition', () => {
  test('should word-wrap pure identifier to next line but not text content', () => runHTML('linkDefinition/wrapZeroWidthSpace.html'));
});
