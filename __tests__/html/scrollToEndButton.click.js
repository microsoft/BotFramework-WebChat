/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('clicking on the scroll to end button should scroll and focus correctly', () => runHTML('scrollToEndButton.click.html'));
