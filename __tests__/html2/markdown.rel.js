/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('Markdown', () => {
  test('must have rel="noopener noreferrer"', () => runHTML('markdown.rel.html'));
});
