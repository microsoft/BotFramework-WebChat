/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('setting "scrollToEndButtonFontSize" option should change font size', () => runHTML('styleOptions.scrollToEndButtonFontSize.html'));
