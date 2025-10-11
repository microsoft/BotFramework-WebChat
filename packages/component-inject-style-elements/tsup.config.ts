import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['component/src/index.ts'];

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-component-inject-style-elements': './src/index.ts'
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
