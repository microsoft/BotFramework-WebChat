import { injectCSSPlugin } from 'botframework-webchat-styles/build';
import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';
import { componentStyleContent as componentStyleContentPlaceholder } from './src/Styles/createStyles';
import { decoratorStyleContent as decoratorStyleContentPlaceholder } from './src/decorator/private/createStyles';

const config: typeof baseConfig = {
  ...baseConfig,
  entry: {
    'botframework-webchat-component': './src/index.ts',
    'botframework-webchat-component.internal': './src/internal.ts',
    'botframework-webchat-component.decorator': './src/decorator/index.ts'
  },
  esbuildPlugins: [
    injectCSSPlugin({ stylesPlaceholder: componentStyleContentPlaceholder }),
    injectCSSPlugin({ stylesPlaceholder: decoratorStyleContentPlaceholder })
  ],
  loader: {
    ...baseConfig.loader,
    '.css': 'local-css'
  }
};

export default defineConfig([
  {
    ...config,
    format: 'esm'
  },
  {
    ...config,
    format: 'cjs',
    target: [...config.target, 'es2019']
  }
]);
