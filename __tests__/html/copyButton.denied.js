/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('copy button with denied permission should be disabled', () => runHTML('copyButton.denied'));
