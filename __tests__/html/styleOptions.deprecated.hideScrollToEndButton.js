/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

// Remove this on or after 2023-06-02.
test('setting "hideScrollToEndButton" option should hide the scroll to end button', () => runHTML('styleOptions.deprecated.hideScrollToEndButton.html'));
