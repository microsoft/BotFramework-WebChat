import { join } from 'path';
import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

// Redirect import paths for "microsoft-cognitiveservices-speech-sdk(...)"
// to point to es2015 distribution for all importing modules
const resolveCognitiveServicesToES2015 = {
  name: 'microsoft-cognitiveservices-speech-sdk',
  setup(build) {
    build.onResolve({ filter: /microsoft-cognitiveservices-speech-sdk.+/u }, args => ({
      path: join(process.cwd(), 'node_modules', args.path.replace('distrib/lib', 'distrib/es2015') + '.js')
    }));
  }
};

export default defineConfig({
  ...baseConfig,
  entry: {
    'botframework-directlinespeech-sdk': './src/index.js'
  },
  env: {
    ...baseConfig.env,

    // Followings are required by microsoft-cognitiveservices-speech-sdk:
    NODE_TLS_REJECT_UNAUTHORIZED: '',
    SPEECH_CONDUCT_OCSP_CHECK: '',
    SPEECH_OCSP_CACHE_ROOT: ''
  },
  esbuildPlugins: [resolveCognitiveServicesToES2015],
  noExternal: ['event-target-shim']
});
