import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-core': './src/index.ts',
    'botframework-webchat-core.activity': './src/boot/activity.ts',
    'botframework-webchat-core.graph': './src/boot/graph.ts',
    'botframework-webchat-core.internal': './src/boot/internal.ts',
    // Deprecated entrypoint without .js, to be removed on or after 2028-04-24.
    'botframework-webchat-core.deprecated.activity': './src/boot/deprecated/activity.ts',
    'botframework-webchat-core.deprecated.graph': './src/boot/deprecated/graph.ts',
    'botframework-webchat-core.deprecated.internal': './src/boot/deprecated/internal.ts'
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
    target: [...commonConfig.target, 'es2019']
  }
]);
