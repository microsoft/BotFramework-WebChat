import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';

export default defineConfig({
  ...baseConfig,
  entry: {
    'botframework-webchat-component': './src/index.ts',
    'botframework-webchat-component.internal.parseDocumentFromString': './src/internal/parseDocumentFromString.ts',
    'botframework-webchat-component.internal.serializeDocumentIntoString': './src/internal/serializeDocumentIntoString.ts',
    'botframework-webchat-component.internal.useInjectStyles': './src/internal/useInjectStyles.ts',
  }
});
