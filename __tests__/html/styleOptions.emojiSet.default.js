/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

test('Emoji should be enabled by default', () => runHTML('styleOptions.emojiSet.default.html'));
