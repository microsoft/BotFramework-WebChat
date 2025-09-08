import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['api/src/index.ts', 'api-middleware/src/index.ts'];

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-react-hooks': './src/index.ts'
  },
  onSuccess: `${baseConfig.onSuccess} && touch ${DEPENDENT_PATHS.map(path => `../${path}`).join(' ')}`
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
