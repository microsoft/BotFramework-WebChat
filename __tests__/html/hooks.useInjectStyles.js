/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useInjectStyles', () => {
  test('should update <style>', () => runHTML('hooks.useInjectStyles.html'));
});
