import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['api'];

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-api-middleware': './src/index.ts',
    'botframework-webchat-api-middleware.internal': './src/internal.ts',
    'botframework-webchat-api-middleware.legacy': './src/legacy.ts'
  },
  onSuccess: `${baseConfig.onSuccess} && touch ${DEPENDENT_PATHS.map(path => `../${path}/src/buildInfo.ts`).join(' ')}`
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
