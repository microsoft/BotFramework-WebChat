/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

test('Emoji should be disabled when emojiSet is set to false', () => runHTML('styleOptions.emojiSet.disabled.html'));
