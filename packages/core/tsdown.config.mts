import { defineConfig } from 'tsdown';

import { createDualFormatConfigs, packagePattern } from '../../tsdown.base.config.mts';

export default defineConfig(
  createDualFormatConfigs(
    {
      'botframework-webchat-core': './src/index.ts',
      'botframework-webchat-core.activity': './src/boot/activity.ts',
      'botframework-webchat-core.graph': './src/boot/graph.ts',
      'botframework-webchat-core.internal': './src/boot/internal.ts',
      'botframework-webchat-core.json-ld': './src/boot/json-ld.ts',
      'botframework-webchat-core.org-schema': './src/boot/org-schema.ts'
    },
    {
      cjs: config => ({
        define: { ...config.define, 'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"commonjs"' },
        deps: { ...config.deps, alwaysBundle: [packagePattern('uuid')] }
      }),
      esm: config => ({ define: { ...config.define, 'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"esmodules"' } })
    }
  )
);
