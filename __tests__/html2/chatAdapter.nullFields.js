/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('chat adapter', () => {
  test('should render properly if some activity fields are null', () => runHTML('chatAdapter.nullFields.html'));
});
