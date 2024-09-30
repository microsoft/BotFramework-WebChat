import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

export default defineConfig({
  ...baseConfig,
  entry: {
    'botframework-webchat-base': './src/index.ts',
    'botframework-webchat-base.utils': './src/utils/index.ts'
  }
});
