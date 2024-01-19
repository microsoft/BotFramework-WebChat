/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('V1 activity', () => {
  test('adds custom activity', () => runHTML('./middleware-migration/v1.activity.add.html'));
  test('decorates an activity by text', () => runHTML('./middleware-migration/v1.activity.decorate.html'));
  test('removes an activity by text', () => runHTML('./middleware-migration/v1.activity.remove.html'));
  test('replaces an activity by text', () => runHTML('./middleware-migration/v1.activity.replace.html'));
});
