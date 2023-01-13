/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('customization', () => {
  test('should render BasicWebChat components in a different structure', () => runHTML('customization.basicWebChat.restructure.html'));
});
