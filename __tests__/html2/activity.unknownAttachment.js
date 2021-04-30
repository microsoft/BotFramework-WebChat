/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('activity', () => {
  test('should not show unknown attachment', () => runHTML('activity.unknownAttachment.html'));
});
