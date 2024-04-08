/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('link definition', () => {
  test('should display text ellipsis', () => runHTML('linkDefinition/badge.html'));
});
