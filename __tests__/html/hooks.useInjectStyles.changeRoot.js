/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useInjectStyles', () => {
  test('should change style root', () => runHTML('hooks.useInjectStyles.changeRoot.html'));
});
