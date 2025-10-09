import { injectCSSPlugin } from '@msinternal/botframework-webchat-styles/build';
import { defineConfig } from 'tsup';

import { applyConfig } from '../../tsup.base.config';
import { componentCSSContent as componentCSSContentPlaceholder } from './src/stylesheet/ComponentCSS';
import { decoratorCSSContent as decoratorCSSContentPlaceholder } from './src/stylesheet/DecoratorCSS';

// TODO: [P1] Compute this automatically.
const DEPENDENT_PATHS = ['bundle/src/boot/exports/index.ts'];

const commonConfig = applyConfig(config => ({
  ...config,
  entry: {
    'botframework-webchat-component': './src/index.ts',
    'botframework-webchat-component.component': './src/boot/component.ts',
    'botframework-webchat-component.decorator': './src/boot/decorator.ts',
    'botframework-webchat-component.hook': './src/boot/hook.ts',
    'botframework-webchat-component.internal': './src/boot/internal.ts'
  },
  esbuildPlugins: [
    ...(config.esbuildPlugins ?? []),
    injectCSSPlugin({
      // esbuild does not fully support CSS code splitting, every entry point has its own CSS file.
      // Related to https://github.com/evanw/esbuild/issues/608.
      getCSSText: (_source, cssFiles) =>
        cssFiles.find(({ path }) => path.endsWith('botframework-webchat-component.component.css'))?.text,
      stylesPlaceholder: componentCSSContentPlaceholder
    }),
    injectCSSPlugin({ stylesPlaceholder: decoratorCSSContentPlaceholder })
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
