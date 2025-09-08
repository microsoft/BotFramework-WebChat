import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['api', 'api-middleware', 'bundle', 'component', 'debug-theme', 'fluent-theme', 'redux-store'];

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-react-valibot': './src/index.ts'
  },
  onSuccess: `${baseConfig.onSuccess} && touch ${DEPENDENT_PATHS.map(path => `../${path}/src/buildInfo.ts`).join(' ')}`
};

export default defineConfig([
  {
    ...config,
    env: { ...baseConfig.env, module_format: 'esmodules' },
    format: 'esm'
  },
  {
    ...config,
    env: { ...baseConfig.env, module_format: 'commonjs' },
    format: 'cjs',
    target: [...config.target, 'es2019']
  }
]);
