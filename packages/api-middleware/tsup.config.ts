import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-api-middleware': './src/index.ts',
    'botframework-webchat-api-middleware.internal': './src/internal.ts',
    'botframework-webchat-api-middleware.legacy': './src/legacy.ts'
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
