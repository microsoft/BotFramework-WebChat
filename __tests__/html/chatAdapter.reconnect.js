/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('after reconnect should send and receive message as usual', () => runHTML('chatAdapter.reconnect.html'));
