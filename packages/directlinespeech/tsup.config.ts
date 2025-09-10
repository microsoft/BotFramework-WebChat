import { join } from 'path';
import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

// Redirect import paths for "microsoft-cognitiveservices-speech-sdk(...)"
// to point to es2015 distribution for all importing modules
const resolveCognitiveServicesToES2015 = {
  name: 'microsoft-cognitiveservices-speech-sdk',
  setup(build) {
    // ESBuild use Go regular expressions and does not understand Unicode flag.
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /microsoft-cognitiveservices-speech-sdk.+/ }, args => ({
      path: join(process.cwd(), 'node_modules', args.path.replace('distrib/lib', 'distrib/es2015') + '.js')
    }));
  }
};

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
  esbuildPlugins: [resolveCognitiveServicesToES2015],
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
