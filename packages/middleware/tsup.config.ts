import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-middleware': './src/index.ts'
  }
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
