import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

export default defineConfig({
  ...baseConfig,
  env: { ...baseConfig.env, module_format: 'esmodules', transpiler: 'tsup' },
  entry: {
    'botframework-webchat-component': './src/index.ts'
  },
  noExternal: ['event-target-shim']
});
