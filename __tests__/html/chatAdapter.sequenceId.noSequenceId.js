/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('should sort activities by fallback to timestamp', () => runHTML('chatAdapter.sequenceId.noSequenceId.html'));
