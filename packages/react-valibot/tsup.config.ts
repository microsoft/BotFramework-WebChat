import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = [
  'api/src/index.ts',
  'bundle/src/exports/full.ts',
  'component/src/index.ts',
  'debug-theme/src/index.ts',
  'fluent-theme/src/index.ts',
  'redux-store/src/index.ts'
];

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-react-valibot': './src/index.ts'
  },
  onSuccess: `touch ${DEPENDENT_PATHS.map(path => `../${path}`).join(' ')}`
}));

export default defineConfig([
  {
    ...commonConfig,
    format: 'esm'
  },
  {
    ...commonConfig,
    format: 'cjs',
    target: [...commonConfig.target, 'es2019']
  }
]);
