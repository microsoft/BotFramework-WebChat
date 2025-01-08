/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('bot typing message in out-of-order fashion', () => {
  test('should sort typing activity based on channelData.sequenceNumber', () => runHTML('typing/outOfOrder.sequenceNumber'));
});
