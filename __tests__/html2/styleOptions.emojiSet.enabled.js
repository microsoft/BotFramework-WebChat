/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

test('Emoji should be enabled when emojiSet is set to true', () => runHTML('styleOptions.emojiSet.enabled.html'));
