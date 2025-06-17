import path from 'path';
import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.base.config';
import type { Plugin as RollupPlugin } from 'rollup';

import pkg from './package.json';

const iifeDeps = Object.keys(pkg.dependencies);

// Redirect import paths for "microsoft-cognitiveservices-speech-sdk(...)"
// to point to es2015 distribution for all importing modules
const resolveCognitiveServicesToES2015: RollupPlugin = {
  name: 'microsoft-cognitiveservices-speech-sdk',
  resolveId(source) {
    if (/^microsoft-cognitiveservices-speech-sdk.*$/u.test(source)) {
      let p = path.join(process.cwd(), '../../node_modules', source.replace('distrib/lib', 'distrib/es2015') + '.js');
      p.endsWith('node_modules/microsoft-cognitiveservices-speech-sdk.js') &&
        (p = path.join(
          p,
          '../microsoft-cognitiveservices-speech-sdk/distrib/es2015/microsoft.cognitiveservices.speech.sdk.js'
        ));
      return p;
    }
    return null;
  }
};

// Redirect import paths for "react" and "react-dom"
const resolveReact: RollupPlugin = {
  name: 'isomorphic-react',
  resolveId(source) {
    if (source === 'react' || source === 'react-dom') {
      const p = path.join(process.cwd(), '../../node_modules', `isomorphic-${source}/dist/${source}.js`);
      return p;
    }
    return null;
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
  plugins: [resolveCognitiveServicesToES2015, resolveReact],
  noExternal: [
    'react',
    'isomorphic-react',
    '@babel/runtime',
    'memoize-one',
    'microsoft-cognitiveservices-speech-sdk',
    'web-speech-cognitive-services',
    // Belows are the dependency chain related to "regex" where it is named export-only and does not work on Webpack 4/PPUX (CJS cannot import named export).
    // Webpack 4: "Can't import the named export 'rewrite' from non EcmaScript module (only default export is available)"
    'shiki', // shiki -> @shikijs/core -> @shikijs/engine-javascript -> regex
    // Issues related to Webpack 4 when it tries to statically analyze dependencies.
    // The way `microsoft-cognitiveservices-speech-sdk` imported the `uuid` package (in their `Guid.js`) is causing esbuild/tsdown to proxy require() into __require() for dynamic loading.
    // Webpack 4 cannot statically analyze the code and failed with error "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted".
    'uuid'
  ]
};

const iifeConfig = {
  ...config,
  dts: false,
  env: {
    ...config.env,
    module_format: 'global'
  },
  plugins: [...config.plugins, resolveReact],
  format: 'umd',
  platform: 'browser',
  // target: [...config.target, 'es2019'],
  noExternal: [...iifeDeps, ...config.noExternal],
  outputOptions(outputOptions) {
    outputOptions.entryFileNames = '[name].js';
    return outputOptions;
  }
};

export default defineConfig([
  // Build IIFE before CJS/ESM to make npm start faster.
  {
    ...iifeConfig,
    entry: {
      'webchat-minimal': './src/bundle/index-minimal.ts'
    }
  },
  {
    ...iifeConfig,
    entry: {
      webchat: './src/bundle/index.ts'
    }
  },
  {
    ...iifeConfig,
    entry: {
      'webchat-es5': './src/bundle/index-es5.ts'
    }
  },
  {
    ...config,
    format: 'esm'
  }
  // {
  //   ...config,
  //   format: 'cjs',
  //   target: [...config.target, 'es2019']
  // }
]);
