/** @jest-environment @happy-dom/jest-environment */

test('require() should load the CommonJS entrypoint', () => {
  expect(require.resolve('botframework-webchat-fluent-theme')).toMatch(
    /[/\\]dist[/\\]botframework-webchat-fluent-theme\.js$/u
  );

  expect(require('botframework-webchat-fluent-theme').buildInfo).toHaveProperty('moduleFormat', 'commonjs');
});
