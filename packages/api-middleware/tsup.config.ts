import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-api-middleware': './src/index.ts',
    'botframework-webchat-api-middleware.legacy': './src/legacy.ts'
  }
}));

export default defineConfig([
  {
    ...commonConfig,
    format: 'esm',
    onSuccess: 'touch ./package.json'
  },
  {
    ...commonConfig,
    format: 'cjs',
    target: [...commonConfig.target, 'es2019']
  }
]);
