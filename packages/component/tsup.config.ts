import { injectCSSPlugin } from 'botframework-webchat-styles/build';
import { defineConfig, Options } from 'tsup';
import baseConfig from '../../tsup.base.config';
import { componentStyleContent as componentStyleContentPlaceholder } from './src/Styles/createStyles';
import { decoratorStyleContent as decoratorStyleContentPlaceholder } from './src/decorator/private/createStyles';

const config: typeof baseConfig = {
  ...baseConfig,
  esbuildOptions(options) {
    options.define.WEBCHAT_PERF_CONTEXT = JSON.stringify('bit context');
    // options.define.WEBCHAT_PERF_CONTEXT = JSON.stringify('stable state');
  },
  entry: {
    'botframework-webchat-component': './src/index.ts',
    'botframework-webchat-component.internal': './src/internal.ts',
    'botframework-webchat-component.decorator': './src/decorator/index.ts'
  },
  esbuildPlugins: [
    injectCSSPlugin({ stylesPlaceholder: componentStyleContentPlaceholder }),
    injectCSSPlugin({ stylesPlaceholder: decoratorStyleContentPlaceholder })
  ]
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
