import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

export default defineConfig({
  ...baseConfig,
  entry: {
    'botframework-webchat-styles': './src/index.ts',
    'botframework-webchat-styles.react': './src/react/index.ts',
    'botframework-webchat-styles.build': './src/build/index.ts'
  },
  format: ['esm', 'cjs']
});
