import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-api': './src/index.ts',
    'botframework-webchat-api.decorator': './src/boot/decorator.ts',
    'botframework-webchat-api.hook': './src/boot/hook.ts',
    'botframework-webchat-api.internal': './src/boot/internal.ts',
    'botframework-webchat-api.middleware': './src/boot/middleware.ts'
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
