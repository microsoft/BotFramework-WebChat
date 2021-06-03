/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('setting "newMessageButtonFontSize" option should change font size', () => runHTML('styleOptions.deprecated.newMessageButtonFontSize.html'));
