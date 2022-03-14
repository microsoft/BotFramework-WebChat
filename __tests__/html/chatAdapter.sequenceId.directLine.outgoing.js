/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('should render outgoing activities based on sequence ID', () => runHTML('chatAdapter.sequenceId.directLine.outgoing.html'));
