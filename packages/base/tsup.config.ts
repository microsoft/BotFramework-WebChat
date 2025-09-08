import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['api', 'api-middleware', 'bundle', 'component', 'core', 'debug-theme', 'fluent-theme'];

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-base': './src/index.ts',
    'botframework-webchat-base.utils': './src/utils/index.ts'
  },
  onSuccess: `${baseConfig.onSuccess} && touch ${DEPENDENT_PATHS.map(path => `../${path}/src/index.ts`).join(' ')}`
};

export default defineConfig([
  {
    ...config,
    format: 'esm'
  },
  {
    ...config,
    format: 'cjs',
    target: [...config.target, 'es2019']
  }
]);
