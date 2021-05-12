/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Avatar', () => {
  test('with undefined initials should not leave gutter space', () => runHTML('avatar.undefinedInitials.html'));
});
