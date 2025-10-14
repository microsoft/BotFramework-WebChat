import { injectCSSPlugin } from '@msinternal/botframework-webchat-styles/build';
import { type Plugin } from 'esbuild';
import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';
import { chatLauncherStyleContent as chatLauncherStyleContentPlaceholder } from './src/stylesheet/createChatLauncherStyleElements';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['api/src/index.ts'];

// eslint-disable-next-line no-unused-vars
const isomorphicReactPlugin: Plugin = {
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

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-experience-chat-launcher': './src/index.ts'
  },
  external: ['react', 'react-dom'],
  esbuildPlugins: [
    ...config.esbuildPlugins,
    isomorphicReactPlugin,
    injectCSSPlugin({ stylesPlaceholder: chatLauncherStyleContentPlaceholder })
  ],
  onSuccess: `touch ${DEPENDENT_PATHS.map(path => `../${path}`).join(' ')}`
}));

export default defineConfig([
  {
    ...commonConfig,
    format: 'esm'
  },
  {
    ...commonConfig,
    format: 'cjs',
    target: [...commonConfig.target, 'es2019']
  }
]);
