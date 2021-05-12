/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Direct Line App Service Service chat adapter', () => {
  test('should connect to the MockBot.', () => runHTML('chatAdapter.directLineAppServiceExtension.html'));
});
