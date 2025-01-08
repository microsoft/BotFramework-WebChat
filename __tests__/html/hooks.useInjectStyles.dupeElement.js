/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useInjectStyles', () => {
  test('should work with duplicated <style> elements', () => runHTML('hooks.useInjectStyles.dupeElement.html'));
});
