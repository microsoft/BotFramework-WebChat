import path from 'path';
import { defineConfig, type Format, type Options } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

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

// Everything in the same Config object will be code-split together.
function buildConfig(format: Format, bundled: boolean): Options {
  return applyConfig(config => ({
    ...config,
    define: {
      ...config.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT':
        format === 'cjs'
          ? '"commonjs"'
          : format === 'esm'
            ? '"esmodules"'
            : format === 'iife'
              ? '"global"'
              : '"unknown"'
    },
    entry: {
      'botframework-webchat': './src/exports/full.ts',
      'botframework-webchat.middleware': './src/exports/middleware.ts'
    },
    env: {
      // Followings are required by microsoft-cognitiveservices-speech-sdk:
      NODE_TLS_REJECT_UNAUTHORIZED: '',
      SPEECH_CONDUCT_OCSP_CHECK: '',
      SPEECH_OCSP_CACHE_ROOT: ''
    },
    // Intentionally overriding existing esbuild plugins.
    esbuildPlugins: [],
    format,
    noExternal: bundled
      ? [/./u]
      : [
          ...(config.noExternal ?? []),
          '@babel/runtime',
          'memoize-one',
          'web-speech-cognitive-services',
          // Belows are the dependency chain related to "regex" where it is named export-only and does not work on Webpack 4/PPUX (CJS cannot import named export).
          // Webpack 4: "Can't import the named export 'rewrite' from non EcmaScript module (only default export is available)"
          'shiki', // shiki -> @shikijs/core -> @shikijs/engine-javascript -> regex
          // Issues related to Webpack 4 when it tries to statically analyze dependencies.
          // The way `microsoft-cognitiveservices-speech-sdk` imported the `uuid` package (in their `Guid.js`) is causing esbuild/tsup to proxy require() into __require() for dynamic loading.
          // Webpack 4 cannot statically analyze the code and failed with error "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted".
          'uuid'
        ],
    outDirWithTemp: bundled ? undefined : ['./exports/', './exports.tmp/'],
    target: format === 'cjs' || format === 'iife' ? [...config.target, 'es2019'] : config.target
  }));
}

export default defineConfig([
  buildConfig('cjs', true),
  buildConfig('esm', true),
  buildConfig('cjs', false),
  buildConfig('esm', false),
  {
    ...buildConfig('iife', true),
    dts: false,
    entry: {
      webchat: './src/iife/full.ts',
      'webchat-es5': './src/iife/full-es5.ts',
      'webchat-minimal': './src/iife/minimal.ts'
    },
    // Intentionally overriding existing esbuild plugins.
    esbuildPlugins: [resolveReact],
    outExtension() {
      return { js: '.js' };
    },
    platform: 'browser'
  }
]);
