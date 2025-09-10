import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

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
  applyConfig(config => ({
    ...config,
    define: {
      ...config.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"esmodules"'
    },
    entry: {
      'botframework-webchat-debug-theme': './src/index.ts'
    },
    format: 'esm'
  })),
  applyConfig(config => ({
    ...config,
    define: {
      ...config.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"commonjs"'
    },
    entry: {
      'botframework-webchat-debug-theme': './src/index.ts'
    },
    format: 'cjs',
    target: [...config.target, 'es2019']
  })),
  applyConfig(config => ({
    ...config,
    define: {
      ...config.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"global"'
    },
    entry: {
      'botframework-webchat-debug-theme.development': './src/bundle.ts'
    },
    esbuildPlugins: [...(config.esbuildPlugins || []), umdResolvePlugin],
    format: 'iife',
    outExtension() {
      return { js: '.js' };
    }
  })),
  applyConfig(config => ({
    ...config,
    define: {
      ...config.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"global"'
    },
    entry: {
      'botframework-webchat-debug-theme.production.min': './src/bundle.ts'
    },
    esbuildPlugins: [...(config.esbuildPlugins || []), umdResolvePlugin],
    format: 'iife',
    minify: true,
    outExtension() {
      return { js: '.js' };
    }
  }))
]);
