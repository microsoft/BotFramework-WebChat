/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

test('ESModules should export matching buildInfo', () => {
  const { buildInfo } = jest.requireActual('../../dist/botframework-webchat-api.mjs');

  expect(buildInfo).toHaveProperty('buildTool', 'tsup');
  expect(buildInfo).toHaveProperty('moduleFormat', 'esmodules');
});
