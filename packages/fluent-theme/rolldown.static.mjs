/// <reference types="node" />

/* eslint-env node */
/* eslint-disable no-restricted-globals */

import { injectCSSRolldownPlugin } from '@msinternal/botframework-webchat-styles/build';
import { resolve } from 'path';
import { build } from 'rolldown';
import { fileURLToPath } from 'url';
import { cssPlugin, inputSourceMapPlugin } from '../../rolldownPlugins.mjs';

// TODO: [P0] We cannot import TypeScript file here.
const fluentStyleContentPlaceholder = '@--FLUENT-STYLES-CONTENT--@';

const target = ['chrome100', 'firefox100', 'safari15'];

build({
  checks: { pluginTimings: false },
  external: /^(?:botframework-webchat|react(?:-dom)?(?:\/|$))/u,
  input: { 'botframework-webchat-fluent-theme': './src/index.ts' },
  moduleTypes: { '.js': 'jsx' },
  output: {
    chunkFileNames: 'botframework-webchat-fluent-theme.chunk-[hash].js',
    // Minified: legal comments only, rolldown keeps annotations and JSDoc by default.
    comments: { annotation: false, jsdoc: false, legal: true },
    dir: resolve(fileURLToPath(import.meta.url), '../static/'),
    format: 'esm',
    minify: true,
    sourcemap: true
  },
  platform: 'browser',
  plugins: [
    cssPlugin({ minify: true, target }),
    inputSourceMapPlugin(),
    injectCSSRolldownPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })
  ],
  resolve: { alias: { 'html-react-parser': '@msinternal/html-react-parser' } },
  // Browsers have no `process`: React and other packages read `process.env.NODE_ENV` to pick their production code.
  transform: { define: { 'process.env.NODE_ENV': '"production"' }, target },
  tsconfig: './src/tsconfig.json'
});
