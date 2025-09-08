import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['api'];

const commonConfig: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-core': './src/index.ts',
    'botframework-webchat-core.internal': './src/internal/index.ts'
  },
  onSuccess: `${baseConfig.onSuccess} && touch ${DEPENDENT_PATHS.map(path => `../${path}/src/buildInfo.ts`).join(' ')}`
};

export default defineConfig([
  {
    ...commonConfig,
    define: { ...commonConfig.define, WEB_CHAT_BUILD_INFO_MODULE_FORMAT: '"esmodules"' },
    format: 'esm'
  },
  {
    ...commonConfig,
    define: { ...commonConfig.define, WEB_CHAT_BUILD_INFO_MODULE_FORMAT: '"commonjs"' },
    format: 'cjs',
    target: [...commonConfig.target, 'es2019']
  }
]);
