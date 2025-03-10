/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('link definition', () => {
  test('should display text ellipsis', () => runHTML('linkDefinition/badge'));
  test('should display text ellipsis in Fluent theme', () => runHTML('linkDefinition/badge?variant=fluent'));
  test('should display text ellipsis in Copilot theme', () => runHTML('linkDefinition/badge?variant=copilot'));
});
