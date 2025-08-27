import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

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
    build.onResolve({ filter: /^botframework-webchat-api\/middleware$/ }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-api/middleware.ts')
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
  }
};

export default defineConfig([
  {
    ...baseConfig,
    entry: { 'botframework-webchat-debug-theme': './src/index.ts' },
    format: 'esm'
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-debug-theme': './src/index.ts' },
    format: 'cjs',
    target: [...baseConfig.target, 'es2019']
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-debug-theme.development': './src/bundle.ts' },
    env: { ...baseConfig.env, module_format: 'global' },
    esbuildPlugins: [...(baseConfig.esbuildPlugins || []), umdResolvePlugin],
    format: 'iife',
    outExtension() {
      return { js: '.js' };
    }
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-debug-theme.production.min': './src/bundle.ts' },
    env: { ...baseConfig.env, module_format: 'global' },
    loader: {
      ...baseConfig.loader
    },
    esbuildPlugins: [...(baseConfig.esbuildPlugins || []), umdResolvePlugin],
    format: 'iife',
    minify: true,
    outExtension() {
      return { js: '.js' };
    }
  }
]);
