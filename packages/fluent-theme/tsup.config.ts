import { injectCSSPlugin } from '@msinternal/botframework-webchat-styles/build';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Format } from 'tsup';

import { applyConfig } from '../../tsup.base.config';
import { fluentStyleContent as fluentStyleContentPlaceholder } from './src/styles/createStyles';

const EXTERNAL_PACKAGES = ['botframework-webchat'];

const reactResolvePlugin = {
  name: 'react-resolve',
  setup(build) {
    // ESBuild use Go regular expressions and does not understand Unicode flag.
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^react$/ }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/react.ts')
    }));
  }
};

const umdResolvePlugin = {
  name: 'umd-resolve',
  setup(build) {
    // ESBuild use Go regular expressions and does not understand Unicode flag.
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^botframework-webchat-api$/ }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-api/index.ts')
    }));

    // ESBuild use Go regular expressions and does not understand Unicode flag.
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^botframework-webchat-api\/decorator$/ }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-api/decorator.ts')
    }));

    // ESBuild use Go regular expressions and does not understand Unicode flag.
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^botframework-webchat-component$/ }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-component/index.ts')
    }));

    // ESBuild use Go regular expressions and does not understand Unicode flag.
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^botframework-webchat-component\/internal$/ }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-component/internal.ts')
    }));

    // ESBuild use Go regular expressions and does not understand Unicode flag.
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^botframework-webchat-component\/decorator$/ }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-component/decorator.ts')
    }));
  }
};

// Everything in the same Config object will be code-split together.
function buildApplyConfig(format: Format, bundled: boolean) {
  return (
    fn: (
      config: ReturnType<Parameters<typeof applyConfig>[0]>
    ) => ReturnType<Parameters<typeof applyConfig>[0]> = config => config
  ) =>
    applyConfig(config =>
      fn({
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
        entry: { 'botframework-webchat-fluent-theme': './src/index.ts' },
        esbuildPlugins: [
          // Intentionally overriding existing esbuild plugins.
          // ...(config.esbuildPlugins || []),
          injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder }),
          reactResolvePlugin
        ],
        external: bundled ? EXTERNAL_PACKAGES : undefined,
        format,
        noExternal: bundled
          ? [new RegExp(`^(?!${EXTERNAL_PACKAGES.map(packageName => `(${packageName}($|\/))`, 'u').join('|')}).+`)]
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
      })
    );
}

export default defineConfig([
  buildApplyConfig('cjs', true)(),
  buildApplyConfig('esm', true)(),
  buildApplyConfig('cjs', false)(),
  buildApplyConfig('esm', false)(),

  buildApplyConfig(
    'iife',
    true
  )(config => ({
    ...config,
    entry: { 'botframework-webchat-fluent-theme.development': './src/bundle.ts' },
    esbuildPlugins: [
      ...(config.esbuildPlugins || []),
      umdResolvePlugin,
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })
    ],
    outExtension() {
      return { js: '.js' };
    }
  })),
  buildApplyConfig(
    'iife',
    true
  )(config => ({
    ...config,
    entry: { 'botframework-webchat-fluent-theme.production.min': './src/bundle.ts' },
    esbuildPlugins: [
      ...(config.esbuildPlugins || []),
      umdResolvePlugin,
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })
    ],
    outExtension() {
      return { js: '.js' };
    }
  }))
]);
