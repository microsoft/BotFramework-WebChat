import { injectCSSPlugin } from '@msinternal/botframework-webchat-styles/build';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';
import { fluentStyleContent as fluentStyleContentPlaceholder } from './src/styles/createStyles';

const umdResolvePlugin = {
  name: 'umd-resolve',
  setup(build) {
    // ESBuild use Go regular expressions and does not understand Unicode flag.
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^react$/ }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/react.ts')
    }));

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

export default defineConfig([
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme': './src/index.ts' },
    env: { ...baseConfig.env, module_format: 'commonjs' },
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins || []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })
    ],
    format: ['cjs'],
    target: [...baseConfig.target, 'es2019']
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme': './src/index.ts' },
    env: { ...baseConfig.env, module_format: 'esmodules' },
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins || []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })
    ],
    format: ['esm']
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme.development': './src/bundle.ts' },
    env: { ...baseConfig.env, module_format: 'global' },
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins || []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder }),
      umdResolvePlugin
    ],
    format: 'iife',
    outExtension() {
      return { js: '.js' };
    }
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme.production.min': './src/bundle.ts' },
    env: { ...baseConfig.env, module_format: 'global' },
    loader: {
      ...baseConfig.loader
    },
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins || []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder }),
      umdResolvePlugin
    ],
    format: 'iife',
    minify: true,
    outExtension() {
      return { js: '.js' };
    }
  }
]);
