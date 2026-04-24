import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-api': './src/index.ts',
    'botframework-webchat-api.decorator': './src/boot/decorator.ts',
    'botframework-webchat-api.graph': './src/boot/graph.ts',
    'botframework-webchat-api.hook': './src/boot/hook.ts',
    'botframework-webchat-api.internal': './src/boot/internal.ts',
    'botframework-webchat-api.middleware': './src/boot/middleware.ts',
    // Deprecated entrypoint without .js, to be removed on or after 2028-04-24.
    'botframework-webchat-api.deprecated.decorator': './src/boot/deprecated/decorator.ts',
    'botframework-webchat-api.deprecated.graph': './src/boot/deprecated/graph.ts',
    'botframework-webchat-api.deprecated.hook': './src/boot/deprecated/hook.ts',
    'botframework-webchat-api.deprecated.internal': './src/boot/deprecated/internal.ts',
    'botframework-webchat-api.deprecated.middleware': './src/boot/deprecated/middleware.ts'
  }
}));

export default defineConfig([
  {
    ...commonConfig,
    define: {
      ...commonConfig.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"esmodules"'
    },
    format: 'esm',
    noExternal: [...(commonConfig.noExternal ?? []), 'globalize'],
    onSuccess: 'touch ./package.json'
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
