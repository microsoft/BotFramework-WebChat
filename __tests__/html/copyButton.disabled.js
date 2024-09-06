/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('copy button should be able to disable', () => runHTML('copyButton.disabled'));
