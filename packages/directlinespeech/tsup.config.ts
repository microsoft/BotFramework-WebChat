import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

const config = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-directlinespeech-sdk': './src/index.js'
  },
  env: {
    ...config.env,

    build_tool: 'tsup',

    // Followings are required by microsoft-cognitiveservices-speech-sdk:
    NODE_TLS_REJECT_UNAUTHORIZED: '',
    SPEECH_CONDUCT_OCSP_CHECK: '',
    SPEECH_OCSP_CACHE_ROOT: ''
  },
  // Intentionally overriding existing esbuild plugins.
  esbuildPlugins: [],
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
    format: 'esm'
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
