/** @jest-environment ./packages/testharness2/src/host/jest/WebDriverEnvironment.js */

describe('Avatar', () => {
  test('with empty initials should leave gutter space', () => runHTML('avatar.emptyInitials.html'));
});
