/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('text url attachment sent from bot should be rendered', () => runHTML('sendFiles.attachmentUrl.html'));
