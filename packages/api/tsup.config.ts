import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-api': './src/index.ts',
    'botframework-webchat-api.decorator': './src/decorator.ts',
    'botframework-webchat-api.internal': './src/internal.ts',
    'botframework-webchat-api.middleware': './src/middleware.ts'
  }
};

export default defineConfig([
  {
    ...config,
    env: { ...config.env, module_format: 'esmodules' },
    format: 'esm',
    noExternal: ['globalize']
  },
  {
    ...config,
    env: { ...config.env, module_format: 'commonjs' },
    format: 'cjs',
    target: [...config.target, 'es2019']
  }
]);
