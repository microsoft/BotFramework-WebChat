import { defineConfig } from 'tsdown';

import { createDualFormatConfigs, iifeOptions, packagePattern, type Config } from '../../tsdown.base.config.mts';

// The sources are JavaScript without a tsconfig.json, the types are written by hand in src/index.d.ts.
function withPackageOptions(config: Config, moduleFormat: string): Partial<Config> {
  return {
    // We need to internalize event-target-shim because it appear as transient packages with a different version.
    deps: { ...config.deps, alwaysBundle: [packagePattern('event-target-shim')] },
    dts: false,
    env: { ...config.env, build_tool: 'tsdown', module_format: moduleFormat },
    tsconfig: false
  };
}

const [esmConfig, cjsConfig] = createDualFormatConfigs(
  { 'botframework-directlinespeech-sdk': './src/index.js' },
  {
    cjs: config => withPackageOptions(config, 'commonjs'),
    esm: config => withPackageOptions(config, 'esmodules')
  }
);

// Browser scripts exposing `window.DirectLineSpeech`, with every dependency bundled.
function createIIFEConfig(nodeEnv: 'development' | 'production'): Config {
  return {
    ...esmConfig,
    ...iifeOptions(esmConfig),
    entry: { [`directlinespeech.${nodeEnv === 'production' ? 'production.min' : nodeEnv}`]: './src/bundle.js' },
    env: { ...esmConfig.env, module_format: 'global', node_env: nodeEnv, NODE_ENV: nodeEnv },
    minify: nodeEnv === 'production',
    onSuccess: undefined
  };
}

export default defineConfig([
  esmConfig,
  cjsConfig,
  createIIFEConfig('development'),
  createIIFEConfig('production'),
  {
    ...esmConfig,
    dts: { dtsOnly: true, sourcemap: false },
    entry: { 'botframework-directlinespeech-sdk': './src/index.d.ts' },
    format: ['esm', 'cjs'],
    onSuccess: undefined
  }
]);
