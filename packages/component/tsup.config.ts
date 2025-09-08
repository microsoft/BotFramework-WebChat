import { injectCSSPlugin } from '@msinternal/botframework-webchat-styles/build';
import { defineConfig } from 'tsup';
import baseConfig from '../../tsup.base.config';
import { componentStyleContent as componentStyleContentPlaceholder } from './src/Styles/createStyles';
import { decoratorStyleContent as decoratorStyleContentPlaceholder } from './src/decorator/private/createStyles';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['bundle'];

const commonConfig: typeof baseConfig = {
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
  ],
  onSuccess: `${baseConfig.onSuccess} && touch ${DEPENDENT_PATHS.map(path => `../${path}/src/index.ts`).join(' ')}`
};

export default defineConfig([
  {
    ...commonConfig,
    define: { ...commonConfig.define, WEB_CHAT_BUILD_INFO_MODULE_FORMAT: '"esmodules"' },
    format: 'esm'
  },
  {
    ...commonConfig,
    define: { ...commonConfig.define, WEB_CHAT_BUILD_INFO_MODULE_FORMAT: '"commonjs"' },
    format: 'cjs',
    target: [...commonConfig.target, 'es2019']
  }
]);
