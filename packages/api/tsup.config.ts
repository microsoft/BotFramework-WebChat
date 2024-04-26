import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

export default defineConfig({
  ...baseConfig,
  dts: { resolve: true },
  entry: {
    'botframework-webchat-api': './src/index.ts',
    'botframework-webchat-api.internal': './src/internal.ts'
  },
  env: { ...baseConfig.env, module_format: 'esmodules', transpiler: 'tsup' },
  noExternal: ['globalize']
});
