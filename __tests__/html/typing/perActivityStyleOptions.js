/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('bot typing message with a custom typing indicator in channelData', () => {
  test('should only show/hide typing indicator accordingly', () => runHTML('typing/perActivityStyleOptions'));
});
