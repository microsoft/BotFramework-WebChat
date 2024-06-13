/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useInjectStyles', () => {
  test('should update <link>', () => runHTML('hooks.useInjectStyles.link.html'));
});
