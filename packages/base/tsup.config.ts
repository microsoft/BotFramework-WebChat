import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-base': './src/index.ts',
    'botframework-webchat-base.utils': './src/utils/index.ts'
  }
};

export default defineConfig([
  {
    ...config,
    env: { ...config.env, module_format: 'esmodules' },
    format: 'esm'
  },
  {
    ...config,
    env: { ...config.env, module_format: 'commonjs' },
    format: 'cjs',
    target: [...config.target, 'es2019']
  }
]);
