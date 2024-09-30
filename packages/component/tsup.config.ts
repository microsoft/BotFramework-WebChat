import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';
import { componentStyleContent as componentStyleContentPlaceholder } from './src/Styles/createStyles';
import { decoratorStyleContent as decoratorStyleContentPlaceholder } from './src/decorator/private/createStyles';
import { injectCSSPlugin } from 'botframework-webchat-styles/build';

export default defineConfig({
  ...baseConfig,
  loader: {
    ...baseConfig.loader,
    '.css': 'local-css'
  },
  esbuildPlugins: [
    injectCSSPlugin({ stylesPlaceholder: componentStyleContentPlaceholder }),
    injectCSSPlugin({ stylesPlaceholder: decoratorStyleContentPlaceholder })
  ],
  entry: {
    'botframework-webchat-component': './src/index.ts',
    'botframework-webchat-component.internal': './src/internal.ts',
    'botframework-webchat-component.decorator': './src/decorator/index.ts'
  },
  format: ['esm', 'cjs']
});
