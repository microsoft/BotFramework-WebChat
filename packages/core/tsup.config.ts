import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-core': './src/index.ts',
    'botframework-webchat-core.activity': './src/boot/activity.ts',
    'botframework-webchat-core.graph': './src/boot/graph.ts',
    'botframework-webchat-core.internal': './src/boot/internal.ts',
    'botframework-webchat-core.json-ld': './src/boot/json-ld.ts',
    'botframework-webchat-core.org-schema': './src/boot/org-schema.ts'
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
    onSuccess: 'touch ./package.json'
  },
  {
    ...commonConfig,
    define: {
      ...commonConfig.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"commonjs"'
    },
    format: 'cjs',
    noExternal: ['uuid'],
    target: [...commonConfig.target, 'es2019']
  }
]);
