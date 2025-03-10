/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('Emoji should be enabled and customizable through emojiSet', () => runHTML('styleOptions.emojiSet.custom.html'));
