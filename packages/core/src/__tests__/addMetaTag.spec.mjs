/// <reference types="jest" />

test('ESModules should export matching buildInfo', () => {
  const { buildInfo } = jest.requireActual('../../dist/botframework-webchat-core.mjs');

  expect(buildInfo).toHaveProperty('buildTool', 'tsdown');
  expect(buildInfo).toHaveProperty('moduleFormat', 'esmodules');
});
