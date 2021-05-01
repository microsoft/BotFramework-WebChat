/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

test('Emoji should be enabled by default', () => runHTML('styleOptions.emojiSet.default.html'));
