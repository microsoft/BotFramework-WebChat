import { injectCSSPlugin } from '@msinternal/botframework-webchat-styles/build';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';
import { fluentStyleContent as fluentStyleContentPlaceholder } from './src/stylesheet/createFluentThemeStyleElements';

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
    build.onResolve({ filter: /^botframework-webchat-api\// }, args => ({
      path: join(
        fileURLToPath(import.meta.url),
        `../src/external.umd/botframework-webchat-api/${args.path.split('/').slice(1).join('/')}.ts`
      )
    }));

    // ESBuild use Go regular expressions and does not understand Unicode flag.
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^botframework-webchat-component$/ }, () => ({
      path: join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-component/index.ts')
    }));

    // ESBuild use Go regular expressions and does not understand Unicode flag.
    // eslint-disable-next-line require-unicode-regexp
    build.onResolve({ filter: /^botframework-webchat-component\// }, args => ({
      path: join(
        fileURLToPath(import.meta.url),
        `../src/external.umd/botframework-webchat-component/${args.path.split('/').slice(1).join('/')}.ts`
      )
    }));
  }
};

export default defineConfig([
  applyConfig(config => ({
    ...config,
    define: {
      ...config.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"commonjs"'
    },
    entry: { 'botframework-webchat-fluent-theme': './src/index.ts' },
    esbuildPlugins: [
      ...(config.esbuildPlugins ?? []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })
    ],
    format: ['cjs'],
    target: [...config.target, 'es2019']
  })),
  applyConfig(config => ({
    ...config,
    define: {
      ...config.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"esmodules"'
    },
    entry: { 'botframework-webchat-fluent-theme': './src/index.ts' },
    esbuildPlugins: [
      ...(config.esbuildPlugins ?? []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })
    ],
    format: ['esm']
  })),
  applyConfig(config => ({
    ...config,
    define: {
      ...config.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"global"'
    },
    entry: { 'botframework-webchat-fluent-theme.development': './src/bundle.ts' },
    esbuildPlugins: [
      ...(config.esbuildPlugins ?? []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder }),
      umdResolvePlugin
    ],
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
    entry: { 'botframework-webchat-fluent-theme.production.min': './src/bundle.ts' },
    esbuildPlugins: [
      ...(config.esbuildPlugins ?? []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder }),
      umdResolvePlugin
    ],
    format: 'iife',
    minify: true,
    outExtension() {
      return { js: '.js' };
    }
  }))
]);
