import { injectCSSPlugin } from '@msinternal/botframework-webchat-styles/build';
import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';
import { componentStyleContent as componentStyleContentPlaceholder } from './src/Styles/createStyles';
import { decoratorStyleContent as decoratorStyleContentPlaceholder } from './src/decorator/private/createStyles';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['bundle/src/exports/full.ts'];

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-component': './src/index.ts',
    'botframework-webchat-component.internal': './src/internal.ts',
    'botframework-webchat-component.decorator': './src/decorator/index.ts'
  },
  esbuildPlugins: [
    ...(config.esbuildPlugins ?? []),
    injectCSSPlugin({ stylesPlaceholder: componentStyleContentPlaceholder }),
    injectCSSPlugin({ stylesPlaceholder: decoratorStyleContentPlaceholder })
  ],
  onSuccess: `touch ${DEPENDENT_PATHS.map(path => `../${path}`).join(' ')}`
}));

export default defineConfig([
  {
    ...commonConfig,
    define: {
      ...commonConfig.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"esmodules"'
    },
    format: 'esm'
  },
  {
    ...commonConfig,
    define: {
      ...commonConfig.define,
      'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"commonjs"'
    },
    format: 'cjs',
    target: [...commonConfig.target, 'es2019']
  }
]);
