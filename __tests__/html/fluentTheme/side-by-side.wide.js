/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Fluent theme applied', () => {
  test('side by side left - transcript, right - pre chat message', () =>
    runHTML('fluentTheme/side-by-side.wide?focus=1'));
  test('side by side left - transcript, right - pre chat message fluent', () =>
    runHTML('fluentTheme/side-by-side.wide?variant=fluent&variant=fluent'));
  test('side by side left - transcript, right - transcript', () =>
    runHTML('fluentTheme/side-by-side.wide?transcript=0&transcript=2&focus=0&focus=1'));
  test('side by side left - transcript, right - pre liner', () =>
    runHTML('fluentTheme/side-by-side.wide?transcript=0&transcript=3'));
  test('side by side left - transcript, right - streaming', () =>
    runHTML('fluentTheme/side-by-side.wide?transcript=0&transcript=4'));
  test('side by side left - fluent, right - fluent', () =>
    runHTML('fluentTheme/side-by-side.wide?transcript=0&transcript=2&focus=1&variant=fluent&variant=fluent'));
  test('side by side left - transcript, right - codeblock', () =>
    runHTML('fluentTheme/side-by-side.wide?transcript=0&transcript=5&focus=1&focus-preset=viewCode'));
  test('side by side left - transcript, right - codeblock dark', () =>
    runHTML(
      'fluentTheme/side-by-side.wide?transcript=0&transcript=5&focus=1&focus-preset=viewCode&codeBlockTheme=github-dark-default'
    ));
  test('side by side left - transcript, right - feedback', () =>
    runHTML('fluentTheme/side-by-side.wide?transcript=0&transcript=6&focus=1&focus-preset=likeDislike'));
});
