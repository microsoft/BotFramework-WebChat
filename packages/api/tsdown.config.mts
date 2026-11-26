import { defineConfig } from 'tsdown';

import { createDualFormatConfigs, packagePattern } from '../../tsdown.base.config.mts';

export default defineConfig(
  createDualFormatConfigs(
    {
      'botframework-webchat-api': './src/index.ts',
      'botframework-webchat-api.decorator': './src/boot/decorator.ts',
      'botframework-webchat-api.graph': './src/boot/graph.ts',
      'botframework-webchat-api.hook': './src/boot/hook.ts',
      'botframework-webchat-api.internal': './src/boot/internal.ts',
      'botframework-webchat-api.middleware': './src/boot/middleware.ts'
    },
    {
      cjs: config => ({ define: { ...config.define, 'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"commonjs"' } }),
      esm: config => ({
        define: { ...config.define, 'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"esmodules"' },
        deps: { ...config.deps, alwaysBundle: [packagePattern('globalize')] }
      })
    }
  )
);
