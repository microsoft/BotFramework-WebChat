/** @jest-environment @happy-dom/jest-environment */

// Every copy of the styles runtime has its own CSSModuleThemeContext: a theme provided through one copy is invisible to
// useStyles() of another copy. Web Chat must ship one copy, from botframework-webchat-component.

const { readdirSync, readFileSync } = require('fs');
const { dirname, join } = require('path');

// Lists the build outputs that bundle the styles runtime, per format, from esbuild metafiles (tsup `metafile: true`).
function outputsWithStylesRuntime(packageName) {
  const distPath = dirname(require.resolve(packageName));

  return Object.fromEntries(
    // Paths come from require.resolve() and the dist folder listing, not from user input.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    readdirSync(distPath)
      .filter(name => /^metafile-\w+\.json$/u.test(name))
      .map(name => [
        name,
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        Object.entries(JSON.parse(readFileSync(join(distPath, name), 'utf8')).outputs)
          .filter(([, { inputs }]) =>
            Object.keys(inputs).some(input => input.includes('styles/dist/botframework-webchat-styles.react.'))
          )
          .map(([output]) => output)
      ])
  );
}

test('botframework-webchat/internal.js should re-export the styles runtime of botframework-webchat-component', () => {
  const bundleInternal = require('botframework-webchat/internal.js');
  const componentInternal = require('botframework-webchat-component/internal.js');

  expect(bundleInternal.CSSModuleThemeComposer).toBe(componentInternal.CSSModuleThemeComposer);
  expect(bundleInternal.useStyles).toBe(componentInternal.useStyles);
});

test('botframework-webchat-component should bundle the styles runtime into one chunk per module format', () => {
  const outputs = outputsWithStylesRuntime('botframework-webchat-component');

  expect(Object.keys(outputs).sort()).toEqual(['metafile-cjs.json', 'metafile-esm.json']);
  expect(outputs['metafile-cjs.json']).toHaveLength(1);
  expect(outputs['metafile-esm.json']).toHaveLength(1);
});

test('botframework-webchat should not bundle the styles runtime', () =>
  // IIFE builds get it from botframework-webchat-component.
  expect(outputsWithStylesRuntime('botframework-webchat')).toEqual({
    'metafile-cjs.json': [],
    'metafile-esm.json': [],
    'metafile-iife.json': []
  }));

test('botframework-webchat-fluent-theme should not bundle the styles runtime', () =>
  expect(outputsWithStylesRuntime('botframework-webchat-fluent-theme')).toEqual({
    'metafile-cjs.json': [],
    'metafile-esm.json': [],
    'metafile-iife.json': []
  }));
