import { join } from 'node:path';
import { defineConfig } from 'tsdown';
import { fileURLToPath } from 'node:url';
import baseConfig from '../../tsdown.base.config';
import { fluentStyleContent as fluentStyleContentPlaceholder } from './src/styles/createStyles';
import { injectCSSPlugin } from 'botframework-webchat-styles/build';
import LightningCSS from 'unplugin-lightningcss';
import type { Plugin } from 'rollup';

import pkg from './package.json';

const iifeDeps = [
  'botframework-webchat-component/decorator',
  'botframework-webchat-api/decorator',
  'botframework-webchat-component/internal'
].concat(Object.keys(pkg.dependencies));

const umdResolvePlugin: Plugin = {
  name: 'umd-resolve',
  resolveId(source) {
    if (source === 'react') {
      return join(fileURLToPath(import.meta.url), '../src/external.umd/react.ts');
    }
    if (source === 'botframework-webchat-api') {
      return join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-api/index.ts');
    }
    if (source === 'botframework-webchat-api/decorator') {
      return join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-api/decorator.ts');
    }
    if (source === 'botframework-webchat-component') {
      return join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-component/index.ts');
    }
    if (source === 'botframework-webchat-component/internal') {
      return join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-component/internal.ts');
    }
    if (source === 'botframework-webchat-component/decorator') {
      return join(fileURLToPath(import.meta.url), '../src/external.umd/botframework-webchat-component/decorator.ts');
    }
    return null;
  }
};

export default defineConfig([
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme': './src/index.ts' },
    env: { ...baseConfig.env, module_format: 'commonjs' },
    plugins: [LightningCSS.rolldown()],
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins || []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })
    ],
    format: ['cjs'],
    target: [...baseConfig.target, 'es2019'],
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme': './src/index.ts' },
    plugins: [LightningCSS.rolldown()],
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins || []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })
    ],
    format: ['esm']
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme.development': './src/bundle.ts' },
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins || []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })
    ],
    plugins: [LightningCSS.rolldown(), umdResolvePlugin],
    format: 'iife',
    outputOptions(outputOptions) {
      outputOptions.entryFileNames = '[name].js';
      outputOptions.globals = {
        react: 'React',
        'react/jsx-runtime': 'React'
      };
      return outputOptions;
    },
    noExternal: iifeDeps
  },
  {
    ...baseConfig,
    entry: { 'botframework-webchat-fluent-theme.production.min': './src/bundle.ts' },
    esbuildPlugins: [
      ...(baseConfig.esbuildPlugins || []),
      injectCSSPlugin({ stylesPlaceholder: fluentStyleContentPlaceholder })
    ],
    plugins: [LightningCSS.rolldown(), umdResolvePlugin],
    format: 'iife',
    minify: true,
    outputOptions(outputOptions) {
      outputOptions.entryFileNames = '[name].js';
      outputOptions.globals = {
        react: 'React',
        'react/jsx-runtime': 'React'
      };
      return outputOptions;
    },
    noExternal: iifeDeps
  }
]);
