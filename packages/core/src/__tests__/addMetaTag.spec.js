/// <reference types="jest" />

test('CommonJS should export matching buildInfo', () => {
  const { buildInfo } = jest.requireActual('../../dist/botframework-webchat-core.js');

  expect(buildInfo).toHaveProperty('buildTool', 'tsup');
  expect(buildInfo).toHaveProperty('moduleFormat', 'commonjs');
});
