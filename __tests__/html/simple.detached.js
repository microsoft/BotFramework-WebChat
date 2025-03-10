/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('should render on a detached node', () => runHTML('simple.detached.html'));
