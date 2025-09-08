import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = [
  'api/src/index.ts',
  'api-middleware/src/index.ts',
  'bundle/src/boot/exports/full.ts',
  'component/src/index.ts',
  'debug-theme/src/index.ts',
  'fluent-theme/src/index.ts',
  'redux-store/src/index.ts'
];

const commonConfig: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-react-valibot': './src/index.ts'
  },
  onSuccess: `${baseConfig.onSuccess} && touch ${DEPENDENT_PATHS.map(path => `../${path}`).join(' ')}`
};

export default defineConfig([
  {
    ...commonConfig,
    env: { ...baseConfig.env, module_format: 'esmodules' },
    format: 'esm'
  },
  {
    ...commonConfig,
    env: { ...baseConfig.env, module_format: 'commonjs' },
    format: 'cjs',
    target: [...commonConfig.target, 'es2019']
  }
]);
