import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['component/src/index.ts'];

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-api': './src/index.ts',
    'botframework-webchat-api.decorator': './src/decorator.ts',
    'botframework-webchat-api.internal': './src/internal.ts',
    'botframework-webchat-api.middleware': './src/middleware.ts'
  },
  onSuccess: `touch ${DEPENDENT_PATHS.map(path => `../${path}`).join(' ')}`
}));

export default defineConfig([
  {
    ...commonConfig,
    define: {
      ...commonConfig.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"esmodules"'
    },
    format: 'esm',
    noExternal: [...(commonConfig.noExternal ?? []), 'globalize']
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
