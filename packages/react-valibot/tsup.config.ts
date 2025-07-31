import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-react-valibot': './src/index.ts'
  }
};

export default defineConfig([
  {
    ...config,
    env: { ...baseConfig.env, module_format: 'esmodules' },
    format: 'esm'
  },
  {
    ...config,
    env: { ...baseConfig.env, module_format: 'commonjs' },
    format: 'cjs',
    target: [...config.target, 'es2019']
  }
]);
