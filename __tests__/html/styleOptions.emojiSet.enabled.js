/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('Emoji should be enabled when emojiSet is set to true', () => runHTML('styleOptions.emojiSet.enabled.html'));
