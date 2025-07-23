import { injectCSSPlugin } from 'botframework-webchat-styles/build';
import { defineConfig, Options } from 'tsup';
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
    ...(baseConfig.esbuildPlugins ?? []),
    injectCSSPlugin({ stylesPlaceholder: componentStyleContentPlaceholder }),
    injectCSSPlugin({ stylesPlaceholder: decoratorStyleContentPlaceholder })
  ]
};

export default defineConfig([
  {
    ...config,
    env: {
      ...config.env,
      module_format: 'esmodules'
    },
    format: 'esm'
  },
  {
    ...config,
    env: {
      ...config.env,
      module_format: 'commonjs'
    },
    format: 'cjs',
    target: [...config.target, 'es2019']
  }
]);
