import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

export default defineConfig({
  ...baseConfig,
  dts: true,
  experimentalDts: false,
  entry: {
    'botframework-webchat-component': './src/index.ts'
  },
  noExternal: ['event-target-shim']
});
