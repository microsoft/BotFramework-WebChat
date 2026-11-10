import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

const config = applyConfig(config => ({
  ...config,
  // The entry point is JavaScript, its types are written by hand.
  dts: {
    entry: {
      'botframework-directlinespeech-sdk': './src/index.d.ts'
    }
  },
  entry: {
    'botframework-directlinespeech-sdk': './src/index.js'
  },
  env: {
    ...config.env,
    build_tool: 'tsup'
  },
  // We need to internalize event-target-shim because it appear as transient packages with a different version.
  noExternal: [...(config.noExternal ?? []), 'event-target-shim']
}));

// Browser scripts exposing `window.DirectLineSpeech`, with every dependency bundled.
const iifeConfig = {
  ...config,
  dts: false,
  format: 'iife',
  globalName: 'DirectLineSpeech',
  outExtension() {
    return { js: '.js' };
  },
  target: [...config.target, 'es2019']
} satisfies typeof config;

export default defineConfig([
  {
    ...config,
    env: {
      ...config.env,
      module_format: 'esmodules'
    },
    format: 'esm',
    onSuccess: 'touch ./package.json'
  },
  {
    ...config,
    env: {
      ...config.env,
      module_format: 'commonjs'
    },
    format: 'cjs',
    target: [...config.target, 'es2019']
  },
  {
    ...iifeConfig,
    entry: {
      'directlinespeech.development': './src/index.js'
    },
    env: {
      ...iifeConfig.env,
      module_format: 'global',
      node_env: 'development',
      NODE_ENV: 'development'
    },
    // Both browser scripts would write the same metafile-iife.json, keep the production one.
    metafile: false,
    minify: false
  },
  {
    ...iifeConfig,
    entry: {
      'directlinespeech.production.min': './src/index.js'
    },
    env: {
      ...iifeConfig.env,
      module_format: 'global',
      node_env: 'production',
      NODE_ENV: 'production'
    },
    minify: true
  }
]);
