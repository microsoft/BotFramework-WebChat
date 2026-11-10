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
  }
]);
