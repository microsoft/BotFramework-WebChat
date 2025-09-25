/// <reference types="node" />

/* eslint-env node */
/* eslint-disable no-console */
/* eslint-disable no-magic-numbers */
/* eslint-disable no-restricted-globals */

import { build, context } from 'esbuild';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line no-unused-vars
const isomorphicReactPlugin = {
  name: 'isomorphic-react',
  setup(build) {
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^(react|react-dom)$/, namespace: 'file' }, ({ path }) => ({
      namespace: 'isomorphic-react',
      path
    }));

    // eslint-disable-next-line require-unicode-regexp
    build.onLoad({ filter: /^react$/, namespace: 'isomorphic-react' }, () => ({
      contents: "import React from 'react'; module.exports = globalThis.React || React;"
    }));

    // eslint-disable-next-line require-unicode-regexp
    build.onLoad({ filter: /^react-dom$/, namespace: 'isomorphic-react' }, () => ({
      contents: "import ReactDOM from 'react-dom'; module.exports = globalThis.ReactDOM || ReactDOM;"
    }));
  }
};

function createWatcherPlugin(name) {
  /** @type { import('esbuild').Plugin } */
  return {
    name: 'watcher',
    setup(build) {
      let buildStart = Date.now();

      console.log(`${name} Running in watch mode`);

      build.onStart(() => {
        buildStart = Date.now();
        console.log(`${name} Build start`);
      });

      build.onEnd(() => console.log(`${name} ⚡ Build success in ${Date.now() - buildStart}ms`));
    }
  };
}

/** @type { Map<string, import('esbuild').BuildOptions> } */
const configs = new Map();

function getPendingConfig() {
  for (const value of configs.values()) {
    if (value.write !== false) {
      return value;
    }
  }
}

const BASE_CONFIG = {
  alias: {
    adaptivecards: '@msinternal/adaptivecards',
    'base64-js': '@msinternal/base64-js',
    'botframework-directlinejs': '@msinternal/botframework-directlinejs',
    'html-react-parser': '@msinternal/html-react-parser',
    'microsoft-cognitiveservices-speech-sdk': '@msinternal/microsoft-cognitiveservices-speech-sdk',
    'object-assign': '@msinternal/object-assign',
    'react-is': '@msinternal/react-is'
  },
  bundle: true,
  chunkNames: 'botframework-webchat/[name]-[hash]',
  entryNames: '[dir]/[name]',
  external: ['react', 'react-dom'],
  format: 'esm',
  loader: { '.js': 'jsx' },
  minify: true,
  outdir: resolve(fileURLToPath(import.meta.url), `../static/`),
  platform: 'browser',
  sourcemap: true,
  splitting: true,
  write: true,

  /** @type { import('esbuild').Plugin[] } */
  plugins: [
    {
      name: 'static-builder',
      setup(build) {
        // eslint-disable-next-line require-unicode-regexp
        build.onResolve({ filter: /^[^.]/ }, async args => {
          // "external" field only works if the plug-in give up (return undefined.)
          if (args.path === 'react' || args.path === 'react-dom') {
            return undefined;
          }

          return undefined;
        });
      }
    }
  ]
};

async function buildNextConfig() {
  const config = getPendingConfig();

  if (!config) {
    return;
  }

  await build({
    ...config,
    ...BASE_CONFIG
  });

  // HACK: We are using the "write" field to signal the config is completed.
  config.write = false;
}

(async () => {
  // eslint-disable-next-line prefer-destructuring
  const [_0, _1, watch] = process.argv;

  // Rules to select what packages to externalize:
  // - All of our published packages
  //    - Web devs can import our stuff just like they are on npm
  // - Peer dependencies, such as `react` and `react-dom`
  //    - Web devs can use import map to reconfigure what version of dependencies they want

  configs.set('botframework-webchat', {
    chunkNames: `[name]-[hash]`,
    entryNames: `[dir]/[name]`,
    // TODO: [P1] This list should be computed automatically to prevent missing exports.
    entryPoints: {
      'botframework-webchat': './src/boot/exports/index.ts',
      'botframework-webchat/component': './src/boot/exports/component.ts',
      'botframework-webchat/decorator': './src/boot/exports/decorator.ts',
      'botframework-webchat/hook': './src/boot/exports/hook.ts',
      'botframework-webchat/internal': './src/boot/exports/internal.ts',
      'botframework-webchat/middleware': './src/boot/exports/middleware.ts',
      'botframework-webchat-core': 'botframework-webchat-core',
      'botframework-webchat-core/internal': 'botframework-webchat-core/internal',
      'botframework-webchat-api': 'botframework-webchat-api',
      'botframework-webchat-api/decorator': 'botframework-webchat-api/decorator',
      'botframework-webchat-api/hook': 'botframework-webchat-api/hook',
      'botframework-webchat-api/internal': 'botframework-webchat-api/internal',
      'botframework-webchat-api/middleware': 'botframework-webchat-api/middleware',
      'botframework-webchat-component': 'botframework-webchat-component',
      'botframework-webchat-component/component': 'botframework-webchat-component/component',
      'botframework-webchat-component/decorator': 'botframework-webchat-component/decorator',
      'botframework-webchat-component/hook': 'botframework-webchat-component/hook',
      'botframework-webchat-component/internal': 'botframework-webchat-component/internal'
    }
  });

  // Put `react` and `react-dom` under `/static` for conveniences when using in sovereign cloud or airgapped environment.
  configs.set('react', {
    chunkNames: `react/[name]-[hash]`,
    entryNames: `[dir]/[name]`,
    entryPoints: {
      react: '@msinternal/react'
    }
  });

  configs.set('react-dom', {
    chunkNames: `react-dom/[name]-[hash]`,
    entryNames: `[dir]/[name]`,
    entryPoints: {
      'react-dom': '@msinternal/react-dom'
    }
  });

  configs.set('react-18', {
    chunkNames: `react.18/[name]-[hash]`, // Some web servers are not good at handling @.
    entryNames: `[dir]/[name]`,
    entryPoints: {
      'react.18': '@msinternal/react-18',
      'react.18/jsx-dev-runtime': '@msinternal/react-18/jsx-dev-runtime',
      'react.18/jsx-runtime': '@msinternal/react-18/jsx-runtime'
    }
  });

  configs.set('react-dom-18', {
    chunkNames: `react-dom.18/[name]-[hash]`, // Some web servers are not good at handling @.
    entryNames: `[dir]/[name]`,
    entryPoints: {
      'react-dom.18': '@msinternal/react-dom-18',
      'react-dom.18/client': '@msinternal/react-dom-18/client'
    }
  });

  // Prevent infinite-loop.
  for (let i = 0; i < 10000; i++) {
    // eslint-disable-next-line no-await-in-loop
    await buildNextConfig();
  }

  if (watch === '--watch') {
    const ourConfigs = [];

    for (const [key, config] of configs) {
      if (key.startsWith('botframework-webchat')) {
        const ourConfig = { ...config, ...BASE_CONFIG };

        ourConfig.plugins.push(createWatcherPlugin(key));

        ourConfigs.push(ourConfig);
      }
    }

    await Promise.all(ourConfigs.map(async config => (await context(config)).watch()));
  }
})();
