/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

test('text url attachment sent from bot should be rendered', () => runHTML('sendFiles.attachmentUrl.html'));
