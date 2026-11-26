import { injectCSSRolldownPlugin } from '@msinternal/botframework-webchat-styles/build';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Rolldown } from 'tsdown';

import { createDualFormatConfigs, iifeOptions, type Config } from '../../tsdown.base.config.mts';
import { fluentStyleContent as fluentStyleContentPlaceholder } from './src/stylesheet/createFluentThemeStyleElements.ts';

const EXTERNAL_UMD_PATH = join(fileURLToPath(import.meta.url), '../src/external.umd');

// The IIFE builds use React, Web Chat API and Web Chat component from the page (window.React, window.WebChat).
const umdResolvePlugin: Rolldown.Plugin = {
  name: 'umd-resolve',
  resolveId: {
    filter: { id: /^(?:react|react-dom|botframework-webchat-(?:api|component)(?:\/.*)?)$/u },
    handler(id) {
      const [packageName, ...subpath] = id.split('/');

      return packageName === 'react' || packageName === 'react-dom'
        ? join(EXTERNAL_UMD_PATH, `${packageName}.ts`)
        : join(EXTERNAL_UMD_PATH, packageName, subpath.length ? subpath.join('/') : 'index.ts');
    }
  }
};

function withPackageOptions(config: Config, moduleFormat: string): Partial<Config> {
  return {
    define: { ...config.define, 'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': JSON.stringify(moduleFormat) },
    plugins: [...config.plugins, injectCSSRolldownPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })]
  };
}

const [esmConfig, cjsConfig] = createDualFormatConfigs(
  { 'botframework-webchat-fluent-theme': './src/index.ts' },
  {
    cjs: config => withPackageOptions(config, 'commonjs'),
    esm: config => withPackageOptions(config, 'esmodules')
  }
);

function createIIFEConfig(name: 'development' | 'production.min'): Config {
  return {
    ...esmConfig,
    ...iifeOptions(esmConfig),
    define: { ...esmConfig.define, 'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"global"' },
    entry: { [`botframework-webchat-fluent-theme.${name}`]: './src/bundle.ts' },
    minify: name === 'production.min' || esmConfig.minify,
    onSuccess: undefined,
    plugins: [...esmConfig.plugins, umdResolvePlugin],
    // Unlike the bundle, the theme scripts are not lowered to ES2019.
    target: esmConfig.target
  };
}

export default defineConfig([
  esmConfig,
  cjsConfig,
  createIIFEConfig('development'),
  createIIFEConfig('production.min')
]);
