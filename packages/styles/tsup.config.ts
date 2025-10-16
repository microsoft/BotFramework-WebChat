import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-styles': './src/index.ts',
    'botframework-webchat-styles.build': './src/build/index.ts',
    'botframework-webchat-styles.react': './src/react/index.ts'
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
