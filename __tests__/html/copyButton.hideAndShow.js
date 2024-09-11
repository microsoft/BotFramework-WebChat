/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('copy button should not show as copied on hide/show', () => runHTML('copyButton.hideAndShow'));
