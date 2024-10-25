import path from 'path';
import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

// Redirect import paths for "microsoft-cognitiveservices-speech-sdk(...)"
// to point to es2015 distribution for all importing modules
const resolveCognitiveServicesToES2015 = {
  name: 'microsoft-cognitiveservices-speech-sdk',
  setup(build) {
    build.onResolve({ filter: /microsoft-cognitiveservices-speech-sdk.+/u }, args => ({
      path: path.join(process.cwd(), '../../node_modules', args.path.replace('distrib/lib', 'distrib/es2015') + '.js')
    }));
  }
};

// Redirect import paths for "react" and "react-dom"
const resolveReact = {
  name: 'isomorphic-react',
  setup(build) {
    build.onResolve({ filter: /^(react|react-dom)$/u }, ({ path: pkgNamne }) => ({
      path: path.join(process.cwd(), '../../node_modules', `isomorphic-${pkgNamne}/dist/${pkgNamne}.js`)
    }));
  }
};

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat': './src/module/exports.ts',
    'botframework-webchat.es5': './src/module/exports-es5.ts',
    'botframework-webchat.minimal': './src/module/exports-minimal.ts'
  },
  env: {
    ...baseConfig.env,

    // Followings are required by microsoft-cognitiveservices-speech-sdk:
    NODE_TLS_REJECT_UNAUTHORIZED: '',
    SPEECH_CONDUCT_OCSP_CHECK: '',
    SPEECH_OCSP_CACHE_ROOT: ''
  },
  esbuildPlugins: [...(baseConfig.esbuildPlugins || []), resolveCognitiveServicesToES2015],
  noExternal: [
    '@babel/runtime',
    'memoize-one',
    'microsoft-cognitiveservices-speech-sdk',
    'web-speech-cognitive-services'
  ]
};

export default defineConfig([
  // Build IIFE before CJS/ESM to make npm start faster.
  {
    ...config,
    dts: false,
    entry: {
      webchat: './src/bundle/index.ts',
      'webchat-es5': './src/bundle/index-es5.ts',
      'webchat-minimal': './src/bundle/index-minimal.ts'
    },
    env: {
      ...config.env,
      module_format: 'global'
    },
    esbuildPlugins: [...config.esbuildPlugins, resolveReact],
    format: 'iife',
    outExtension() {
      return { js: '.js' };
    },
    platform: 'browser',
    target: [...config.target, 'es2019']
  },
  {
    ...config,
    format: 'esm'
  },
  {
    ...config,
    format: 'cjs',
    target: [...config.target, 'es2019']
  }
]);
