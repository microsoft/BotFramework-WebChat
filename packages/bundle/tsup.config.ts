import path from 'path';
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
      path: path.join(process.cwd(), '../../node_modules', args.path.replace('distrib/lib', 'distrib/es2015'))
    }));
  }
};

// Redirect import paths for "react" and "react-dom"
const resolveReact = {
  name: 'isomorphic-react',
  setup(build) {
    // ESBuild use Go regular expressions and does not understand Unicode flag.
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^(react|react-dom)$/ }, ({ path: pkgNamne }) => ({
      path: path.join(process.cwd(), '../../node_modules', `@msinternal/isomorphic-${pkgNamne}/dist/${pkgNamne}.js`)
    }));
  }
};

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat': './src/boot/exports/full.ts',
    'botframework-webchat.es5': './src/boot/exports/full-es5.ts',
    'botframework-webchat.internal': './src/boot/exports/internal.ts',
    'botframework-webchat.middleware': './src/boot/exports/middleware.ts',
    'botframework-webchat.minimal': './src/boot/exports/minimal.ts'
  },
  env: {
    ...config.env,
    // Followings are required by microsoft-cognitiveservices-speech-sdk:
    NODE_TLS_REJECT_UNAUTHORIZED: '',
    SPEECH_CONDUCT_OCSP_CHECK: '',
    SPEECH_OCSP_CACHE_ROOT: ''
  },
  esbuildPlugins: [...(config.esbuildPlugins ?? []), resolveCognitiveServicesToES2015],
  noExternal: [
    ...(config.noExternal ?? []),
    '@babel/runtime',
    'memoize-one',
    'microsoft-cognitiveservices-speech-sdk',
    'web-speech-cognitive-services',
    // Belows are the dependency chain related to "regex" where it is named export-only and does not work on Webpack 4/PPUX (CJS cannot import named export).
    // Webpack 4: "Can't import the named export 'rewrite' from non EcmaScript module (only default export is available)"
    'shiki', // shiki -> @shikijs/core -> @shikijs/engine-javascript -> regex
    // Issues related to Webpack 4 when it tries to statically analyze dependencies.
    // The way `microsoft-cognitiveservices-speech-sdk` imported the `uuid` package (in their `Guid.js`) is causing esbuild/tsup to proxy require() into __require() for dynamic loading.
    // Webpack 4 cannot statically analyze the code and failed with error "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted".
    'uuid'
  ]
}));

export default defineConfig([
  // Build IIFE before CJS/ESM to make npm start faster.
  {
    ...commonConfig,
    define: {
      ...commonConfig.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"global"'
    },
    dts: false,
    entry: {
      webchat: './src/boot/bundle/full.ts',
      'webchat-es5': './src/boot/bundle/full-es5.ts',
      'webchat-minimal': './src/boot/bundle/minimal.ts'
    },
    esbuildPlugins: [...(commonConfig.esbuildPlugins ?? []), resolveReact],
    format: 'iife',
    outExtension() {
      return { js: '.js' };
    },
    platform: 'browser',
    target: [...commonConfig.target, 'es2019']
  },
  {
    ...commonConfig,
    define: {
      ...commonConfig.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"esmodules"'
    },
    format: 'esm'
  },
  {
    ...commonConfig,
    define: {
      ...commonConfig.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"commonjs"'
    },
    format: 'cjs',
    target: [...commonConfig.target, 'es2019']
  }
]);
