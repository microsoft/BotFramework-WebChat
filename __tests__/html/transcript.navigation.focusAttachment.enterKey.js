/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('should focus inside the attachment on ENTER', () => runHTML('transcript.navigation.focusAttachment.enterKey'));
