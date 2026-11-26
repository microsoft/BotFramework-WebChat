import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Rolldown } from 'tsdown';

import { createDualFormatConfigs, iifeOptions, type Config } from '../../tsdown.base.config.mts';

const EXTERNAL_UMD_PATH = join(fileURLToPath(import.meta.url), '../src/external.umd');

// The IIFE builds use React, Web Chat API and Web Chat component from the page (window.React, window.WebChat).
const umdResolvePlugin: Rolldown.Plugin = {
  name: 'umd-resolve',
  resolveId: {
    filter: { id: /^(?:react|botframework-webchat-(?:api|component)(?:\/.*)?)$/u },
    handler(id) {
      // "botframework-webchat-api/middleware.js" is "external.umd/botframework-webchat-api/middleware.ts".
      const [packageName, subpath = 'index.js'] = id.split('/');

      return packageName === 'react'
        ? join(EXTERNAL_UMD_PATH, 'react.ts')
        : join(EXTERNAL_UMD_PATH, packageName, subpath.replace(/\.js$/u, '.ts'));
    }
  }
};

const [esmConfig, cjsConfig] = createDualFormatConfigs(
  { 'botframework-webchat-debug-theme': './src/index.ts' },
  {
    cjs: config => ({ define: { ...config.define, 'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"commonjs"' } }),
    esm: config => ({ define: { ...config.define, 'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"esmodules"' } })
  }
);

function createIIFEConfig(name: 'development' | 'production.min'): Config {
  return {
    ...esmConfig,
    ...iifeOptions(esmConfig),
    define: { ...esmConfig.define, 'globalThis.WEB_CHAT_BUILD_INFO_MODULE_FORMAT': '"global"' },
    entry: { [`botframework-webchat-debug-theme.${name}`]: './src/bundle.ts' },
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
