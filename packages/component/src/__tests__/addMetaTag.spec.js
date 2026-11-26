/** @jest-environment @happy-dom/jest-environment */

test('CommonJS should export matching buildInfo', () => {
  const { buildInfo } = jest.requireActual('../../dist/botframework-webchat-component.js');

  expect(buildInfo).toHaveProperty('buildTool', 'tsdown');
  expect(buildInfo).toHaveProperty('moduleFormat', 'commonjs');
});
