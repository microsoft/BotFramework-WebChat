import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['api/src/index.ts'];

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-core': './src/index.ts',
    'botframework-webchat-core.internal': './src/internal/index.ts'
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
    format: 'esm'
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
