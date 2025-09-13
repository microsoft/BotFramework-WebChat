import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['bundle/src/full.ts'];

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-preset': './src/boot/actual/index.ts',
    'botframework-webchat-preset.full': './src/boot/actual/full.ts',
    // TODO: [P*] I think we don't need to port preset/middleware, just import from api/middleware.
    // 'botframework-webchat-preset.middleware': './src/boot/actual/middleware.ts',
    'botframework-webchat-preset.minimal': './src/boot/actual/minimal.ts'
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
