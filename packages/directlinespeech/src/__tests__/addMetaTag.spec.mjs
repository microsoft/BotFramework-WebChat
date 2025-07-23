/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

test('ESModules should export matching buildInfo', () => {
  const { buildInfo } = jest.requireActual('../../dist/botframework-directlinespeech-sdk.mjs');

  expect(buildInfo).toHaveProperty('buildTool', 'tsup');
  expect(buildInfo).toHaveProperty('moduleFormat', 'esmodules');
});
