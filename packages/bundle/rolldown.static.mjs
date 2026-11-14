/// <reference types="node" />

/* eslint-env node */
/* eslint-disable no-console */
/* eslint-disable no-magic-numbers */
/* eslint-disable no-restricted-globals */

import { injectCSSRolldownPlugin } from '@msinternal/botframework-webchat-styles/build';
import { resolve } from 'path';
import { readPackage } from 'read-pkg';
import { build } from 'rolldown';
import { fileURLToPath } from 'url';
import { cssPlugin, inputSourceMapPlugin } from '../../rolldownPlugins.mjs';

// TODO: [P0] We cannot import TypeScript file here.
const bundleStyleContentPlaceholder = '@--BUNDLE-STYLES-CONTENT--@';

const target = ['chrome100', 'firefox100', 'safari15'];

const BASE_CONFIG = {
  checks: { pluginTimings: false },
  external: /^react(?:-dom)?(?:\/|$)/u,
  moduleTypes: { '.js': 'jsx' },
  output: {
    chunkFileNames: 'botframework-webchat/chunk-[hash].js',
    // Like esbuild: no annotations or JSDoc in minified code.
    comments: { annotation: false, jsdoc: false, legal: true },
    dir: resolve(fileURLToPath(import.meta.url), '../static/'),
    entryFileNames: '[name].js',
    format: 'esm',
    minify: true,
    sourcemap: true
  },
  platform: 'browser',
  resolve: {
    alias: {
      adaptivecards: '@msinternal/adaptivecards',
      'base64-js': '@msinternal/base64-js',
      'botframework-directlinejs': '@msinternal/botframework-directlinejs',
      'html-react-parser': '@msinternal/html-react-parser',
      'microsoft-cognitiveservices-speech-sdk': '@msinternal/microsoft-cognitiveservices-speech-sdk',
      'object-assign': '@msinternal/object-assign',
      'react-is': '@msinternal/react-is'
    }
  },
  // Like esbuild when minifying for browsers.
  transform: { define: { 'process.env.NODE_ENV': '"production"' }, target },
  tsconfig: './src/tsconfig.json'
};

function* getKeysRecursive(exports) {
  for (const [key, value] of Object.entries(exports)) {
    yield key;

    if (typeof value !== 'string') {
      yield* getKeysRecursive(value);
    }
  }
}

const IGNORED_OWN_PACKAGES = [
  // Not exporting Direct Line Speech.
  'botframework-directlinespeech-sdk',
  // We will export bundle from `/src/boot/` folder directly.
  'botframework-webchat',
  // `fluent-theme` is higher level than bundle, we will export from the package itself separately.
  'botframework-webchat-fluent-theme'
];

(async () => {
  const { workspaces } = await readPackage({ cwd: resolve(fileURLToPath(import.meta.url), '../../../') });

  const allOwnExports = new Map();

  for (const path of workspaces) {
    // eslint-disable-next-line no-await-in-loop
    const packageJson = await readPackage({ cwd: resolve(fileURLToPath(import.meta.url), '../../..', path) });

    if (packageJson.private || !packageJson.exports || IGNORED_OWN_PACKAGES.includes(packageJson.name)) {
      continue;
    }

    const { name: packageName } = packageJson;

    for (const key of getKeysRecursive(packageJson.exports)) {
      if (key.startsWith('.')) {
        if (key === '.') {
          allOwnExports.set(packageName, packageName);
        } else if (key.endsWith('.js')) {
          // ./filename.js -> /filename, `entryFileNames` adds .js.
          allOwnExports.set(`${packageName}${key.slice(1, -3)}`, `${packageName}${key.slice(1)}`);
        }
      }
    }
  }

  // Rules to select what packages to externalize:
  // - All of our own published packages
  //    - Web devs can import our stuff just like they are on npm
  // - Peer dependencies, such as `react` and `react-dom`
  //    - Web devs can use import map to reconfigure what version of dependencies they want

  const input = {
    'botframework-webchat': './src/boot/exports/index.ts',
    'botframework-webchat/component': './src/boot/exports/component.ts',
    'botframework-webchat/decorator': './src/boot/exports/decorator.ts',
    'botframework-webchat/hook': './src/boot/exports/hook.ts',
    'botframework-webchat/internal': './src/boot/exports/internal.ts',
    'botframework-webchat/middleware': './src/boot/exports/middleware.ts',
    'botframework-webchat/schema': './src/boot/exports/schema.ts',
    ...Object.fromEntries(allOwnExports)
  };

  console.log('Exporting the following own entry points:');
  console.log(input);

  const configs = [
    {
      input,
      plugins: [
        cssPlugin({ minify: true, target }),
        inputSourceMapPlugin(),
        injectCSSRolldownPlugin({
          ignoreCSSEntries: ['static/botframework-webchat/component.css'],
          stylesPlaceholder: bundleStyleContentPlaceholder
        })
      ]
    },
    // Put `react` and `react-dom` under `/static` for conveniences when using in sovereign cloud or airgapped environment.
    {
      input: {
        react: '@msinternal/react',
        'react/jsx-dev-runtime': '@msinternal/react/jsx-dev-runtime',
        'react/jsx-runtime': '@msinternal/react/jsx-runtime'
      }
    },
    { input: { 'react-dom': '@msinternal/react-dom', 'react-dom/client': '@msinternal/react-dom/client' } },
    { input: { 'react.baseline': '@msinternal/react-baseline' } },
    { input: { 'react-dom.baseline': '@msinternal/react-dom-baseline' } },
    { input: { 'react.umd-development': '@msinternal/react-umd' } },
    { input: { 'react-dom.umd-development': '@msinternal/react-dom-umd' } }
  ];

  await Promise.all(
    configs.map(({ input, plugins = [inputSourceMapPlugin()] }) => build({ ...BASE_CONFIG, input, plugins }))
  );
})();
