/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('should render incoming activities based on sequence ID', () => runHTML('chatAdapter.sequenceId.simple.html'));
