/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Markdown', () => {
  test('should process valid aria-label attributes set through curly brackets', () => runHTML('markdown.attributes.curlyBrackets.html'));
});
