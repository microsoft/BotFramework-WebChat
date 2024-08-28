import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

export default defineConfig({
  ...baseConfig,
  entry: {
    'botframework-webchat-component': './src/index.ts',
    'botframework-webchat-component.internal': './src/internal.ts',
  }
});
