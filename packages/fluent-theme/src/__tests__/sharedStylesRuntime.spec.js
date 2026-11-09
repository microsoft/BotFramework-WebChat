/** @jest-environment @happy-dom/jest-environment */

// Every copy of the styles runtime has its own CSSModuleThemeContext: a theme provided through one copy is invisible to
// useStyles() of another copy. Web Chat must ship one copy, from botframework-webchat-component.

const { readdirSync, readFileSync } = require('fs');
const { dirname, join } = require('path');

// Only the styles runtime names its context, minifiers keep string literals.
const STYLES_RUNTIME_MARKER = 'WebChat.CSSModuleThemeContext';

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

  // The marker used by the botframework-webchat-fluent-theme test below is in the styles runtime chunks.
  [...outputs['metafile-cjs.json'], ...outputs['metafile-esm.json']].forEach(output =>
    expect(
      // Paths come from the esbuild metafile, not from user input.
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      readFileSync(join(dirname(require.resolve('botframework-webchat-component')), '..', output), 'utf8')
    ).toContain(STYLES_RUNTIME_MARKER)
  );
});

test('botframework-webchat should not bundle its own copy of the styles runtime', () =>
  // IIFE builds (webchat.js) contain one copy, inside the botframework-webchat-component code they inline.
  expect(outputsWithStylesRuntime('botframework-webchat')).toEqual({
    'metafile-cjs.json': [],
    'metafile-esm.json': [],
    'metafile-iife.json': []
  }));

test('botframework-webchat-fluent-theme should not bundle the styles runtime', () => {
  // The package does not publish its esbuild metafiles ("files" in package.json), so check the published scripts.
  const distPath = dirname(require.resolve('botframework-webchat-fluent-theme'));
  const scripts = readdirSync(distPath).filter(name => /\.m?js$/u.test(name));

  // CommonJS, ES modules, and the development and production IIFE builds; no chunks.
  expect(scripts.sort()).toEqual([
    'botframework-webchat-fluent-theme.development.js',
    'botframework-webchat-fluent-theme.js',
    'botframework-webchat-fluent-theme.mjs',
    'botframework-webchat-fluent-theme.production.min.js'
  ]);
  expect(
    scripts.filter(name =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      readFileSync(join(distPath, name), 'utf8').includes(STYLES_RUNTIME_MARKER)
    )
  ).toEqual([]);
});
