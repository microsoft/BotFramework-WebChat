/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('V1 activity middleware', () => {
  test('adds custom activity', () => runHTML('./middleware/v1.activity.add.html'));
  test('decorates an activity by text', () => runHTML('./middleware/v1.activity.decorate.html'));
  test('removes an activity by text', () => runHTML('./middleware/v1.activity.remove.html'));
  test('replaces an activity by text', () => runHTML('./middleware/v1.activity.replace.html'));
  test('adds custom activity with decoration', () => runHTML('./middleware/v1.activity.add.decorate.html'));

  test('removes activity and replaces activity', () => runHTML('./middleware/v1.activity.remove.replace.html'));
  test('replaces activity and removes activity', () => runHTML('./middleware/v1.activity.replace.remove.html'));
});

describe('V1 activity middleware hooks', () => {
  test('decorates an activity when used with useCreateActivityRenderer', () => runHTML('./middleware/v1.useCreateActivityRenderer.decorate.html'));
  test('decorates an activity when used with useRenderAttachment', () => runHTML('./middleware/v1.useRenderAttachment.decorate.html'));
});

describe('V2 activity middleware', () => {
  test('adds custom activity', () => runHTML('./middleware/v2.activity.add.html'));
  test('decorates an activity by text', () => runHTML('./middleware/v2.activity.decorate.html'));
  test('removes an activity by text', () => runHTML('./middleware/v2.activity.remove.html'));
  test('replaces an activity by text', () => runHTML('./middleware/v2.activity.replace.html'));
  test('adds custom activity with decoration', () => runHTML('./middleware/v2.activity.add.decorate.html'));

  test('removes activity and replaces activity', () => runHTML('./middleware/v2.activity.remove.replace.html'));
  test('replaces activity and removes activity', () => runHTML('./middleware/v2.activity.replace.remove.html'));
});

describe('V2 activity middleware hooks', () => {
  test('decorates an activity when used with useCreateActivityRenderer', () => runHTML('./middleware/v2.useCreateActivityRenderer.decorate.html'));
  test('decorates an activity when used with useRenderAttachment', () => runHTML('./middleware/v2.useRenderAttachment.decorate.html'));
});

describe('shim V2 activity middleware', () => {
  test('adds a custom v1 activity with v2 decoration', () =>
    runHTML('./middleware/shim.activity.add-v1.decorate-v2.html'));
  test('adds a custom v2 activity with v1 decoration', () =>
    runHTML('./middleware/shim.activity.add-v2.decorate-v1.html'));

  test('removes v1 activity and replaces v2 activity', () =>
    runHTML('./middleware/shim.activity.remove-v1.replace-v2.html'));
  test('removes v2 activity and replaces v1 activity', () =>
    runHTML('./middleware/shim.activity.remove-v2.replace-v1.html'));
  test('replaces v1 activity and removes v2 activity', () =>
    runHTML('./middleware/shim.activity.replace-v1.remove-v2.html'));
  test('replaces v2 activity and removes v1 activity', () =>
    runHTML('./middleware/shim.activity.replace-v2.remove-v1.html'));
});
