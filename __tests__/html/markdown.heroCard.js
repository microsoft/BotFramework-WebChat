/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Markdown', () => {
  test('should render hero card', () => runHTML('markdown.heroCard.html'));
});
