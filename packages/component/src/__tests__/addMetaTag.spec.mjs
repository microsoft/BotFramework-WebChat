/** @jest-environment @happy-dom/jest-environment */

test('ESModules should export matching buildInfo', () => {
  const { buildInfo } = jest.requireActual('../../dist/botframework-webchat-component.mjs');

  expect(buildInfo).toHaveProperty('buildTool', 'tsdown');
  expect(buildInfo).toHaveProperty('moduleFormat', 'esmodules');
});
