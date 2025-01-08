import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-api': './src/index.ts',
    'botframework-webchat-api.internal': './src/internal.ts',
    'botframework-webchat-api.decorator': './src/decorator/index.ts'
  }
};

export default defineConfig([
  {
    ...config,
    format: 'esm',
    noExternal: ['globalize']
  },
  {
    ...config,
    format: 'cjs',
    target: [...config.target, 'es2019']
  }
]);
