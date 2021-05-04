/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Markdown', () => {
  test('must have rel="noopener noreferrer"', () => runHTML('markdown.rel.html'));
});
