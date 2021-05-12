/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('text file sent from bot should be rendered', () => runHTML('sendFiles.textFiles.html'));
