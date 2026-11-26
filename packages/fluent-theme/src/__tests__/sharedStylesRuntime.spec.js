/** @jest-environment @happy-dom/jest-environment */

// Every copy of the styles runtime has its own CSSModuleThemeContext: a theme provided through one copy is invisible to
// useStyles() of another copy. Web Chat must ship one copy, from botframework-webchat-component.

const { readdirSync, readFileSync } = require('fs');
const { dirname, join } = require('path');

// Only the styles runtime names its context, minifiers keep string literals.
const STYLES_RUNTIME_MARKER = 'WebChat.CSSModuleThemeContext';

// Counts the copies of the styles runtime in every published script of a package, e.g. { 'webchat.js': 1 }.
function stylesRuntimeCopiesByScript(packageName) {
  const distPath = dirname(require.resolve(packageName));

  return Object.fromEntries(
    // Paths come from require.resolve() and the dist folder listing, not from user input.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    readdirSync(distPath)
      .filter(name => /\.m?js$/u.test(name))
      .sort()
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      .map(name => [name, readFileSync(join(distPath, name), 'utf8').split(STYLES_RUNTIME_MARKER).length - 1])
      .filter(([, numCopies]) => numCopies)
  );
}

test('botframework-webchat/internal.js should re-export the styles runtime of botframework-webchat-component', () => {
  const bundleInternal = require('botframework-webchat/internal.js');
  const componentInternal = require('botframework-webchat-component/internal.js');

  expect(bundleInternal.CSSModuleThemeComposer).toBe(componentInternal.CSSModuleThemeComposer);
  expect(bundleInternal.useStyles).toBe(componentInternal.useStyles);
});

test('botframework-webchat-component should bundle the styles runtime into one chunk per module format', () => {
  const copiesByScript = stylesRuntimeCopiesByScript('botframework-webchat-component');
  const scripts = Object.keys(copiesByScript);

  // Chunk names are hashed: one CommonJS (.js) and one ES module (.mjs) chunk, with one copy each.
  expect(scripts.filter(name => name.endsWith('.mjs'))).toHaveLength(1);
  expect(scripts.filter(name => !name.endsWith('.mjs'))).toHaveLength(1);
  expect(Object.values(copiesByScript)).toEqual([1, 1]);
});

test('botframework-webchat should not bundle its own copy of the styles runtime', () =>
  // Only IIFE builds contain one copy, inside the botframework-webchat-component code they inline.
  expect(stylesRuntimeCopiesByScript('botframework-webchat')).toEqual({
    'webchat-es5.js': 1,
    'webchat-minimal.js': 1,
    'webchat.js': 1
  }));

test('botframework-webchat-fluent-theme should not bundle the styles runtime', () => {
  const distPath = dirname(require.resolve('botframework-webchat-fluent-theme'));
  const scripts = readdirSync(distPath).filter(name => /\.m?js$/u.test(name));

  // CommonJS, ES modules, and the development and production IIFE builds; no chunks.
  expect(scripts.sort()).toEqual([
    'botframework-webchat-fluent-theme.development.js',
    'botframework-webchat-fluent-theme.js',
    'botframework-webchat-fluent-theme.mjs',
    'botframework-webchat-fluent-theme.production.min.js'
  ]);
  expect(stylesRuntimeCopiesByScript('botframework-webchat-fluent-theme')).toEqual({});
});
