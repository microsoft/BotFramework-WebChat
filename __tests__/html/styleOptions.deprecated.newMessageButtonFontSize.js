/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

// Remove this on or after 2023-06-02.
test('setting "newMessageButtonFontSize" option should change font size', () => runHTML('styleOptions.deprecated.newMessageButtonFontSize.html'));
