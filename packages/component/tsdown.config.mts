import { injectCSSRolldownPlugin } from '@msinternal/botframework-webchat-styles/build';
import { defineConfig } from 'tsdown';

import { createDualFormatConfigs, type Config } from '../../tsdown.base.config.mts';
import { decoratorStyleContent as decoratorStyleContentPlaceholder } from './src/decorator/stylesheet/createDecoratorStyleElements.ts';
import { componentStyleContent as componentStyleContentPlaceholder } from './src/stylesheet/createComponentStyleElements.ts';

function withPackageOptions(config: Config, moduleFormat: string): Partial<Config> {
  return {
    define: { ...config.define, 'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': JSON.stringify(moduleFormat) },
    plugins: [
      ...config.plugins,
      injectCSSRolldownPlugin({
        // esbuild does not fully support CSS code splitting, every entry point has its own CSS file.
        // Related to https://github.com/evanw/esbuild/issues/608.
        ignoreCSSEntries: ['dist/botframework-webchat-component.component.css'],
        stylesPlaceholder: componentStyleContentPlaceholder
      }),
      injectCSSRolldownPlugin({ stylesPlaceholder: decoratorStyleContentPlaceholder })
    ]
  };
}

export default defineConfig(
  createDualFormatConfigs(
    {
      'botframework-webchat-component': './src/index.ts',
      'botframework-webchat-component.component': './src/boot/component.ts',
      'botframework-webchat-component.decorator': './src/boot/decorator.ts',
      'botframework-webchat-component.hook': './src/boot/hook.ts',
      'botframework-webchat-component.internal': './src/boot/internal.ts'
    },
    {
      cjs: config => withPackageOptions(config, 'commonjs'),
      esm: config => withPackageOptions(config, 'esmodules')
    }
  )
);
